const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const requireLogin = require('../middleware/requireLogin')


router.get('/protected',requireLogin,(req,res)=>{
    res.send("hello user")
})

router.post('/signup',(req,res)=>{
    const {name,email,password} = req.body
    if(!name || !email || !password){
       return res.status(422).json({error:"Please add all fields"})
    }
  
    User.findOne({email}).then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"User already Registered"})
        }
          bcrypt.hash(password,12).then(hashedPassword=>{
            const user = new User({
                email,
                password:hashedPassword,
                name
            })
            user.save().then(user=>{
                res.json({message:"Saved Successfully"})
            }).catch(err=>{
                console.log(err);
            })
          })

        }).catch(err=>{
            console.log(err);
        })
     
   
})
router.post('/signin',(req,res)=>{
    const {email,name,password} = req.body;
    if(!email || !password){
        return res.json({error:"Please provide Email and password"})
    }
    User.findOne({email}).then(savedUser=>{
        if(!savedUser){
            res.json({error:"Invalid email or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                //res.json({message:"Successfully Signed in"})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                const {_id,name,email,followers,following} =savedUser
                res.json({token,user:{_id,name,email,followers,following}})
               
            }else{
               return res.status(422).json({error: "Invalid Email or Password"})
            }
        }).catch(err=>{
            console.log(err);
        })
    })
    
})
module.exports= router