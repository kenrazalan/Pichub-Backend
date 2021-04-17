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
const { googlelogin, signin, signup } = require('../controllers/auth')



const client = new OAuth2Client("292368699085-jb2puctimlk06qjc65noft4bp2v574bu.apps.googleusercontent.com")


 router.route('/signup').post(signup)
 router.route('/signin').post(signin)
 router.route('/googlelogin').post(googlelogin)

// router.post("/resetpassword",(req,res)=>{
//     crypto.randomBytes(32,(error,buffer)=>{
//         if(error){ console.log(error) }
//         const token = buffer.toString("hex")
//         User.findOne({email: req.body.email})
//         .then((user => {
//             if(!user){ return res.status(422).json({ error: "User dont exist with that email"}) }
//             user.resetToken = token
//             user.expiredToken = Date.now() + 3600000
//             user.save()
//             .then((result)=>{
//                 transporter.sendMail({
//                     to: user.email,
//                     from:process.env.USERNAME,
//                     subject: "Password Reset",
//                     html:
//                             `<p>You requested for password reset</p>
//                              <h3>Click this <a href='${EMAIL}/reset/${token}'>link </a>to reset passwrod. </h3>
//                             `
//                 })
//                 res.json({message:"Please check your email or check spam folder if you don't recieve in inbox"})
//             })
//         }))
//     })
// })
module.exports= router