const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")

router.get('/myposts',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy", "_id name pic username")
    .sort('-createdAt')
    .then(myposts=>{ res.json({myposts}) })
    .catch(err=>{  console.log(err); })
})

router.get('/post/:id',requireLogin,(req,res)=>{
    Post.findOne({_id: req.params.id})
    .populate("postedBy","_id name pic followers username")
    .populate("comments.postedBy","_id name pic username")
    .then(post=>{ res.json({post}) })
    .catch(error=>{ return res.status(404).json({error}) })
})

router.get('/followingpost',requireLogin,(req,res)=>{
    //return post by user following
    Post.find({postedBy:{$in:[...req.user.following,req.user._id]}})
    .populate("postedBy","_id name pic followers username")
    .populate("comments.postedBy","_id name pic username")
    .sort('-createdAt')
    .then(posts=>{ res.json({posts}) })
    .catch((error)=>{ console.log(error) })
})
    
router.get('/allpost',requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name pic username")
    .populate("comments.postedBy","_id name pic username")
    .sort('-createdAt')
    .then(posts=>{ res.json({posts}) })
    .catch(err=>{ console.log(err); })
})

router.post('/createpost',requireLogin,(req,res)=>{
    const {body,pic} = req.body
    if(!pic){ return res.status(422).json({error: "Please add all fields"}) }
    req.user.password = undefined
    const post = new Post({
        body,
        photo: pic,
        postedBy: req.user
    })
    post.save()
    .then(result => { res.json({post:result}) })
    .catch(err => { console.log(err); })
})

router.put("/like",requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{ new:true})
    .populate("postedBy","_id name pic followers followings username")
    .populate("comments.postedBy","_id name pic followers followings username")
    .exec((err,result)=>{
        if(err){ return res.status(422).json({error:err})
        }else{ res.json(result)
        }
    }
    )})

    router.put("/unlike",requireLogin,(req,res)=>{
        Post.findByIdAndUpdate(req.body.postId,{ $pull:{likes:req.user._id} },{ new:true})
        .populate("postedBy","_id name pic followers followings username")
        .populate("comments.postedBy","_id name pic followers followings username")
        .exec((err,result)=>{
            if(err){ return res.status(422).json({error:err}) }
            else{ res.json(result) }
        }
        )})

    
    
 router.put("/comment",requireLogin,(req,res)=>{
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment} },{ new:true})
            .populate("comments.postedBy","_id name pic followers followings username")
            .populate("postedBy","_id name pic followers followings username") 
            .exec((err,result)=>{
                if(err){ return res.status(422).json({error:err}) }
                else{ res.json(result) }
                }
             )})

    router.delete('/deletepost/:postId',requireLogin,(req,res)=>{
         Post.findOne({_id: req.params.postId})
                .populate("postedBy","_id")
                .exec((error,post)=>{
                if(!post || error){ return res.status(422).json({error: error})  }
                if(post.postedBy._id.toString() === req.user._id.toString())
                {post.remove()
                     .then(result=>{  res.json(result) })
                     .catch(error=>{  console.log(error)})
                }
        })
    })


module.exports = router