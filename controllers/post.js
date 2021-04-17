const mongoose = require('mongoose')
const Post = mongoose.model("Post")

exports.myPosts = async (req,res) => {
    const myposts = await Post.find({postedBy: req.user._id})
    .populate("postedBy", "_id name pic username")
    .sort('-createdAt')
    .lean().exec()
    res.status(200).json({myposts})
}

exports.goToPost = async (req,res) => {
    const post = await Post.findOne({_id: req.params.id})
    .populate("postedBy","_id name pic followers username")
    .populate("comments.postedBy","_id name pic username")
    .lean().exec()
    res.status(200).json({ post })
}

exports.followingPosts = async(req,res)=>{
    const posts = await Post.find({postedBy:{$in:[...req.user.following,req.user._id]}})
       .populate("postedBy","_id name pic followers username")
       .populate("comments.postedBy","_id name pic username")
       .sort('-createdAt')
       .lean().exec()
       res.status(200).json({posts})
}

exports.allPosts =  async (req,res) => {
    const posts = await Post.find()
    .populate("postedBy","_id name pic username")
    .populate("comments.postedBy","_id name pic username")
    .sort('-createdAt').lean().exec()
    res.status(200).json({posts})
}
exports.createPost =  async (req,res) =>{
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
}

exports.likePost =  async (req,res)=> {
    const like = await Post.findByIdAndUpdate(req.body.postId,
     {  $push:{likes:req.user._id}},{new: true})
     .populate("postedBy","_id name pic followers followings username")
     .populate("comments.postedBy","_id name pic followers followings username")
     .lean().exec()
     res.status(200).json({like})
 }

 exports.unlikePost =async (req,res)=> {
    const unlike = await Post.findByIdAndUpdate(req.body.postId,
        {  $pull:{likes:req.user._id}},{new: true})
        .populate("postedBy","_id name pic followers followings username")
        .populate("comments.postedBy","_id name pic followers followings username")
        .lean().exec()
        res.status(200).json({unlike})
    }
exports.comment = async (req,res) => {
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
}
exports.deletePost =  async (req,res) => {
    const post = await Post.findOne({_id: req.params.postId})
    .populate("postedBy","_id")
    .exec((error,post)=>{
            if(!post || error) { return res.status(422).json({error}) } 
                if(post.postedBy._id.toString() === req.user._id.toString()){
                    post.remove()
                    res.status(200).json(post)
                }
    })
}