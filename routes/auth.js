const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcryptjs')
const crypto =require('crypto')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const sendGridTransport = require('nodemailer-sendgrid-transport')
const {OAuth2Client} = require('google-auth-library')

let transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{  user: process.env.USERNAME, pass: process.env.PASSWORD
    },
    tls: { rejectUnauthorized: false }
})


const client = new OAuth2Client("292368699085-jb2puctimlk06qjc65noft4bp2v574bu.apps.googleusercontent.com")
const emailValidation = '!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
router.post('/signup',(req,res)=>{
    const {name,email,password,pic,username} = req.body
    if(!name || !email || !password ||!username){
       return res.status(422).json({error: " Please add all fields"})
    }
    else if(`${emailValidation}.test(${email})`){
     return res.status(422).json({error: " Invalid Email"})
    }
    User.findOne({email:email}).then((savedUser)=>{
        if(savedUser){ return res.status(422).json({error: "Email already taken"}) }
        User.findOne({username: username})
        .then((user)=>{
         if(user){ return res.status(422).json({error: "Username already taken"}) }
        bcrypt.hash(password,12)
        .then(hashedPassword => {
         const user = new User({
             email,
             password:hashedPassword,
             name,
             pic ,
             username 
         })  
         user.save()
         .then(user=>{ res.json({message: "Sign up success"}) })
         .catch(error=>{ console.log(error) })
        })
     })
    }).catch(error=>{  console.log(error) })
 })  

router.post('/signin',(req,res)=>{
    const {email,name,password} = req.body;
    if(!email || !password){
        return res.json({error:"Please provide Email and password"})
    }
    User.findOne({email})
     .populate({ path: "followers", select: "pic username name" })
     .populate({ path: "following", select: "pic username name" })
     .populate({ path: "savedPosts", select: "likes comments body photo"})
     .then(savedUser=>{
        if(!savedUser){ res.json({error:"Invalid email or password"}) }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                //res.json({message:"Successfully Signed in"})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                const {_id,name,email,followers,following,pic,username,savedPosts} =savedUser
                res.json({token,user:{_id,name,email,followers,following,pic,username,savedPosts}})}
            else { return res.status(422).json({error: "Invalid Email or Password"}) } })
            .catch(err => { console.log(err); })
    })
})

router.post('/googlelogin',(req,res)=>{
    const {tokenId} = req.body;
    client.verifyIdToken({idToken:tokenId,audience:"292368699085-jb2puctimlk06qjc65noft4bp2v574bu.apps.googleusercontent.com"})
    .then(response=>{
        const {email_verified,name,email,picture,given_name} = response.payload
        if(email_verified){
            User.findOne({email})
            .populate({ path: "followers", select: "pic username name" })
            .populate({ path: "following", select: "pic username name" })
            .populate({ path: "savedPosts", select: "likes comments body photo"})
            .exec((err,user)=>{
                if(err){ return res.status(400).json({  error: "Something went wrong" }) }
                else{
                    if(user){
                        const token = jwt.sign({_id:user._id},JWT_SECRET)
                        const {_id,name,email,followers,following,pic,username,savedPosts} =user
                        res.json({token,user:{_id,name,email,followers,following,pic,username,savedPosts}})
                    }else{
                        let password = email+JWT_SECRET;
                        let username = given_name;
                        let pic = picture
                        let newUser = new User({name,email,password,username,pic})
                        newUser.save((err,data)=>{
                            if(err){ return res.status(400).json({ error: "Something went wrong" }) }
                            const token = jwt.sign({_id:data._id},JWT_SECRET)
                            const {_id,name,email,followers,following,pic,username,savedPosts} =newUser;
                            res.json({token,user:{_id,name,email,followers,following,pic,username,savedPosts}})

                        })
                    }
                }
            })
        }
    })
})

router.post("/resetpassword",(req,res)=>{
    crypto.randomBytes(32,(error,buffer)=>{
        if(error){ console.log(error) }
        const token = buffer.toString("hex")
        User.findOne({email: req.body.email})
        .then((user => {
            if(!user){ return res.status(422).json({ error: "User dont exist with that email"}) }
            user.resetToken = token
            user.expiredToken = Date.now() + 3600000
            user.save()
            .then((result)=>{
                transporter.sendMail({
                    to: user.email,
                    from:process.env.USERNAME,
                    subject: "Password Reset",
                    html:
                            `<p>You requested for password reset</p>
                             <h3>Click this <a href='${EMAIL}/reset/${token}'>link </a>to reset passwrod. </h3>
                            `
                })
                res.json({message:"Please check your email or check spam folder if you don't recieve in inbox"})
            })
        }))
    })
})
module.exports= router