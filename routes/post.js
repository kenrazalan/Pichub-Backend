const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")
const {myPosts,goToPost,followingPosts,allPosts,createPost} = require('../controllers/post')

// router.get('/myposts',requireLogin, async (req,res) => {
//     const myposts = await Post.find({postedBy: req.user._id})
//     .populate("postedBy", "_id name pic username")
//     .sort('-createdAt').lean().exec()
//     res.status(200).json({myposts})
// })
router.route("/myposts").get(requireLogin,myPosts)

// router.get('/post/:id',requireLogin, async (req,res)=>{
//     const post = await Post.findOne({_id: req.params.id})
//     .populate("postedBy","_id name pic followers username")
//     .populate("comments.postedBy","_id name pic username")
//     .lean().exec()
//     res.status(200).json({post})
// })
router.route('/post/:id').get(requireLogin,goToPost)


// router.get('/followingpost',requireLogin, async(req,res)=>{
//     const posts = await Post.find({postedBy:{$in:[...req.user.following,req.user._id]}})
//        .populate("postedBy","_id name pic followers username")
//        .populate("comments.postedBy","_id name pic username")
//        .sort('-createdAt').lean().exec()
//         res.status(200).json({posts})
// })
router.route('/followingpost').get(requireLogin,followingPosts)

// router.get('/allpost',requireLogin, async (req,res) => {
//      const posts = await Post.find()
//      .populate("postedBy","_id name pic username")
//      .populate("comments.postedBy","_id name pic username")
//      .sort('-createdAt').lean().exec()
//      res.status(200).json({posts})
// })
router.route('/allpost').get(requireLogin,allPosts)

router.post('/createpost',requireLogin, async (req,res) =>{
    const {body,pic} = req.body
    !pic ? res.status(422).json({error: "Please add all fileds"}) : 
    req.user.password = undefined;
    const post = new Post({
        body,
        photo: pic,
        postedBy: req.user
    })
    post.save()
    res.status(200).json({post})
})
// router.route('/createpost').post(requireLogin,createPost)

router.put('/like',requireLogin,async (req,res)=> {
   const like = await Post.findByIdAndUpdate(req.body.postId,
    {  $push:{likes:req.user._id}},{new: true})
    .populate("postedBy","_id name pic followers followings username")
    .populate("comments.postedBy","_id name pic followers followings username")
    .lean().exec()
    res.status(200).json({like})
})


router.put('/unlike',requireLogin,async (req,res)=> {
    const unlike = await Post.findByIdAndUpdate(req.body.postId,
        {  $pull:{likes:req.user._id}},{new: true})
        .populate("postedBy","_id name pic followers followings username")
        .populate("comments.postedBy","_id name pic followers followings username")
        .lean().exec()
        res.status(200).json({unlike})
    })
    
    
router.put('/comment',requireLogin, async (req,res) => {
    const comment = {
        text : req.body.text,
        postedBy: req.user._id
    }
    const comments = await Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment} },{ new:true})
        .populate("comments.postedBy","_id name pic followers followings username")
        .populate("postedBy","_id name pic followers followings username") 
        .lean().exec()
        res.status(200).json(comments)
})


router.delete('/deletepost/:postId',requireLogin, async (req,res) => {
    const post = await Post.findOne({_id: req.params.postId})
    .populate("postedBy","_id")
    .exec((error,post)=>{
            if(!post || error) { return res.status(422).json({error}) } 
                if(post.postedBy._id.toString() === req.user._id.toString()){
                    post.remove()
                    res.status(200).json(post)
                }
    })
})


module.exports = router