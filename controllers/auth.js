const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const {OAuth2Client} = require('google-auth-library')

const client = new OAuth2Client("292368699085-jb2puctimlk06qjc65noft4bp2v574bu.apps.googleusercontent.com")

// router.route('/signup').post(signup)
// router.route('/signin').post(signin)

exports.signup = async (req,res) => {
    const {name,email,password,pic,username} = req.body
    if(!name || !email || !password ||!username){
       return res.status(422).json({error: " Please add all fields"})
    }
    else if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
     return res.status(422).json({error: " Invalid Email"})
    }
    const savedUser =  await User.findOne({email:email}).lean().exec()
    if(savedUser){ return res.status(422).json({error: "Email already taken"}) }

    const savedUsername =await User.findOne({username: username}).lean().exec()
    if(savedUsername){ return res.status(422).json({error: "Username already taken"}) }

    const hashedPassword =await bcrypt.hash(password,12)
    const user = await new User({
        email,
        password:hashedPassword,
        name,
        pic ,
        username 
    })  
    await user.save()
    res.status(200).json({message: "Sign up success"})
  
}

exports.signin = async (req,res) => {
    const {email,password} = req.body;
    if(!email || !password){
        return res.json({error:"Please provide Email and password"})
    }
    const savedUser =await User.findOne({email})
    .populate({ path: "followers", select: "pic username name" })
    .populate({ path: "following", select: "pic username name" })
    .populate({ path: "savedPosts", select: "likes comments body photo"})
    .lean().exec()
    if(!savedUser){ res.json({error:"Invalid email or password"}) }
    const isDoMatch = await bcrypt.compare(password,savedUser.password)
    if(isDoMatch){
        const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
        const {_id,name,email,followers,following,pic,username,savedPosts} =savedUser
        res.json({token,user:{_id,name,email,followers,following,pic,username,savedPosts}})}
    else { 
        return res.status(422).json({error: "Invalid Email or Password"}) 
    }
}

exports.googlelogin = (req,res)=>{
    const {tokenId} = req.body;
    client.verifyIdToken({idToken:tokenId,audience:"292368699085-jb2puctimlk06qjc65noft4bp2v574bu.apps.googleusercontent.com"})
    .then(response=>{
        const {email_verified,name,email,picture,given_name,sub} = response.payload
        if(email_verified){
            User.findOne({email})
            .populate({ path: "followers", select: "pic username name" })
            .populate({ path: "following", select: "pic username name" })
            .populate({ path: "savedPosts", select: "likes comments body photo"})
            .exec((err,user)=>{
                console.log(user)
                if(err){ return res.status(400).json({  error: "Something went wrong" }) }
                else{
                    if(user){
                        const token = jwt.sign({_id:user._id},JWT_SECRET)
                        const {_id,name,email,followers,following,pic,username,savedPosts} =user
                        res.json({token,user:{_id,name,email,followers,following,pic,username,savedPosts}})
                    }else{
                        let random = Math.floor(Math.random() * 99)
                        let password = email+JWT_SECRET;
                        let username = given_name+random;
                        let pic = picture
                        let newUser = new User({name,email,password,username,pic})
                        console.log(random)
                        newUser.save((err,data)=>{
                            console.log(data)
                            if(err){ return res.status(400).json({ error: "Something went wrong" }) }
                            const token = jwt.sign({_id:data._id},JWT_SECRET)
                            const {_id,name,email,followers,following,pic,username,savedPosts} =newUser;
                            res.json({token,user:{_id,name,email,followers,following,pic,username,savedPosts}})

                        })
                    }
                }
            })
        }
    }).catch(error => console.log(error))
}