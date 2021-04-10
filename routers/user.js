const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")
const User = mongoose.model("User")

router.get("/user/:id",requireLogin,(req,res)=>{
    User.findOne({_id: req.params.id})
    .select("-password")
     .populate({ path: "followers", select: "pic username name followers following" })
     .populate({ path: "following", select: "pic username name followers following" })
     .populate({ path: "savedPosts", select: "likes comments body photo"})
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

router.get("/allusers",requireLogin,(req,res)=>{
    User.find({_id:{$ne: req.user._id}}).select("-password")
    .populate({ path: "followers", select: "pic username name" })
    .populate({ path: "following", select: "pic username name" })
    .populate({ path: "savedPosts", select: "likes comments body photo"})
    .then(user=>res.json(user))
    .catch(err=>{
        console.log(err);
    })
})

router.put("/follow",requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.followId,{
        $push:{followers: req.user._id}
    },{new: true}
    ,(error,result)=>{
        if(error){
            return res.status(422).json({error})
        }
        User.findByIdAndUpdate(req.user._id,{
            $push:{following:req.body.followId }
        },{new: true}).select("-password")
         .populate({ path: "following", select: "pic username name" })
         .populate({ path: "followers", select: "pic username name" })
         .populate({ path: "savedPosts", select: "likes comments body photo"})
        .then(result=>{
            res.json(result)
        }).catch(error=>{
            return res.status(422).json({error})
        })
    })
})

router.put("/save",requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{
        $push:{savedPosts: req.body.saveId}
    },{new: true})         
    .populate({ path: "following", select: "pic username name" })
    .populate({ path: "followers", select: "pic username name" })
    .populate({ path: "savedPosts", select: "likes comments body photo"})
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    }
    ) 
})
router.put('/unsave',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{
        $pull:{savedPosts: req.body.unSaveId}
    },{new: true})
    .populate({ path: "following", select: "pic username name" })
    .populate({ path: "followers", select: "pic username name" })
    .populate({ path: "savedPosts", select: "likes comments body photo"})
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    }
    ) 
})

router.put("/unfollow",requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers: req.user._id}
    },{new: true}
    ,(error,result)=>{
        if(error){
            return res.status(422).json({error})
        }
        User.findByIdAndUpdate(req.user._id,{
            $pull:{following:req.body.unfollowId }
        },{new: true}).select("-password")
         .populate({ path: "following", select: "pic username name" })
         .populate({ path: "followers", select: "pic username name" })
         .populate({ path: "savedPosts", select: "likes comments body photo"})
        .then(result=>{
            res.json(result)
        }).catch(error=>{
            return res.status(422).json({error})
        })
    }
    )
})

router.put("/updatepic",requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{$set:{pic:req.body.pic}},{new: true}
        ,(error,result)=>{
            if(error){
                return res.status(422).json({error:"Cant post picture"})
            }
            res.json(result)
        })
})
router.post('/searchusers',(req,res)=>{
    let userPattern = new RegExp("^"+req.body.query)
    User.find({name:{$regex:userPattern}})
    .select("_id name")
    .then(user=>{
        res.json({user})
    }).catch(error=>{
        console.log(error)
    })
})

router.put('/editprofile',requireLogin,(req,res)=>{
    const { pic, username, name, email } = req.body;
    const fieldsToUpdate = {};
    if (pic) fieldsToUpdate.pic = pic;
    if (username) fieldsToUpdate.username = username;
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    User.findByIdAndUpdate(req.user._id,{$set:{...fieldsToUpdate}},{new: true , runValidators: true}
        ).select("pic username name email")
        .then(result=>{
            res.json(result)
        }).catch(error=>{
            return res.status(422).json({error})
        })
})
router.post('/searchusers',(req,res)=>{
    let userPattern = new RegExp("^"+req.body.query)
    User.find({name:{$regex:userPattern}})
    .select("_id name")
    .then(user=>{
        res.json({user})
    }).catch(error=>{
        console.log(error)
    })
})




module.exports = router