const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")
const {myPosts,goToPost,followingPosts,allPosts,createPost, deletePost, comment, likePost, unlikePost} = require('../controllers/post')


router.route("/myposts").get(requireLogin,myPosts)
router.route('/post/:id').get(requireLogin,goToPost)
router.route('/followingpost').get(requireLogin,followingPosts)
router.route('/allpost').get(requireLogin,allPosts)
router.route('/createpost').post(requireLogin,createPost)
router.put('/like',requireLogin,likePost)
router.put('/unlike',requireLogin,unlikePost)
router.route('/comment').put(requireLogin,comment)
router.route('/deletepost/:postId').delete(requireLogin,deletePost)


module.exports = router