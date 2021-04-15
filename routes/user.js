const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")
const User = mongoose.model("User")


router.get('/user/:id',requireLogin,async (req,res) => {
    const user = await User.findOne({_id: req.params.id})
    .select('-password')
    .populate({ path: "followers", select: "pic username name followers following" })
    .populate({ path: "following", select: "pic username name followers following" })
    .populate({ path: "savedPosts", select: "likes comments body photo"})
    .lean().exec()
    const posts = await Post.find({postedBy: req.params.id})
    .populate("postedBy","_id name")
     res.status(200).json({user,posts})
})

router.get('/allusers',requireLogin, async (req,res) => {
     const users = await User.find({_id: {$ne: req.user._id}})
     .select("-select")
    .populate({ path: "followers", select: "pic username name" })
    .populate({ path: "following", select: "pic username name" })
    .populate({ path: "savedPosts", select: "likes comments body photo"})
    .lean().exec()
     res.status(200).json(users)
})

router.put('/follow',requireLogin,async (req,res) => {
    await User.findByIdAndUpdate(req.body.followId,{$push: {followers: req.user._id}}
        ,{new: true})
    const result = await User.findByIdAndUpdate(req.user._id,{$push:{following:req.body.followId } }
        ,{new: true}).select("-password")
        .populate({ path: "following", select: "pic username name" })
        .populate({ path: "followers", select: "pic username name" })
        .populate({ path: "savedPosts", select: "likes comments body photo"})
        .lean().exec()
        res.status(200).json(result)
})

router.put('/unfollow',requireLogin,async (req,res) => {
    await User.findByIdAndUpdate(req.body.unfollowId,{$pull: {followers: req.user._id}}
        ,{new: true})
    const result = await User.findByIdAndUpdate(req.user._id,{$pull:{following:req.body.unfollowId } }
        ,{new: true})
        .select("-password")
        .populate({ path: "following", select: "pic username name" })
        .populate({ path: "followers", select: "pic username name" })
        .populate({ path: "savedPosts", select: "likes comments body photo"})
        .lean().exec()
        res.status(200).json(result)
})


router.put('/save', requireLogin , async (req,res) => {
    const saved = await User.findByIdAndUpdate(req.user._id,{  $push:{savedPosts: req.body.saveId} }
        ,{new: true})
        .populate({ path: "following", select: "pic username name" })
        .populate({ path: "followers", select: "pic username name" })
        .populate({ path: "savedPosts", select: "likes comments body photo"})
        .lean().exec()

        res.status(200).json(saved)
})

router.put('/unsave', requireLogin , async (req,res) => {
    const unsave = await User.findByIdAndUpdate(req.user._id,{  $pull:{savedPosts: req.body.unSaveId} }
        ,{new: true})
        .populate({ path: "following", select: "pic username name" })
        .populate({ path: "followers", select: "pic username name" })
        .populate({ path: "savedPosts", select: "likes comments body photo"})
        .lean().exec()

        res.status(200).json(unsave)
})


router.post('/searchusers', async (req,res) => {
    let userPattern = new RegExp("^"+req.body.query)
    const user = await User.find({name:{$regex:userPattern}})
    .select("_id name").lean().exec()
    res.json({user})
})

router.put('/editprofile', requireLogin , async (req,res) => {
    const { pic, username, name, email } = req.body;
    const fieldsToUpdate = {};
    if (pic) fieldsToUpdate.pic = pic;
    if (username) fieldsToUpdate.username = username;
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    const result = await User.findByIdAndUpdate(req.user._id,{$set:{...fieldsToUpdate}}
        ,{new: true , runValidators: true}).select("pic username name email")
    res.status(200).json(result)      
})

module.exports = router