const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")
const User = mongoose.model("User")

router.get("/user/:id",requireLogin,(req,res)=>{
    User.findOne({_id: req.params.id})
    .select("-password")
    // .populate({ path: "followers", select: "pic username name" })
    // .populate({ path: "following", select: "pic username name" })
    .then(user=>{
        Post.find({postedBy: req.params.id})
        .populate("postedBy","_id name")
        .exec((error,posts)=>{
            if(error){
                return res.status(422).json({error})
            }
            res.json({user,posts})
        })
    }).catch(error=>{
        return res.status(404).json({error: "User not found"})
    })
})





module.exports = router