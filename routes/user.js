const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { getUser, getAllUsers, follow, unfollow, save, unsave, editprofile, searchUser } = require('../controllers/user')
const requireLogin = require('../middleware/requireLogin')

const User = mongoose.model("User")


router.route('/user/:id').get(requireLogin,getUser)
router.route('/allusers').get(requireLogin,getAllUsers)
router.route('/follow').put(requireLogin,follow)
router.route('/unfollow').put(requireLogin,unfollow)
router.route('/save').put(requireLogin,save)
router.route('/unsave').post(requireLogin,unsave)
router.route('/editprofile').put(requireLogin,editprofile)
router.post('/searchusers', async (req,res) => {
    let userPattern = new RegExp("^"+req.body.query)
    const user = await User.find({name:{$regex:userPattern}})
    .select("_id name").lean().exec()
    res.json({user})
})


module.exports = router