const mongoose = require('mongoose')
const {ObjectId}= mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique:true,
        lowercase: true
    },
    password:{
        type:String,
        required: true
    },
    pic:{
        type: String,
        default:"https://res.cloudinary.com/dtwrzv0of/image/upload/v1602439487/profile_pic_smohie.png"
    },
    savedPosts: [{ type: ObjectId, ref:"Post"}],
    followers:[{type: ObjectId, ref:"User"}],
    following:[{type: ObjectId, ref:"User"}]
})
mongoose.model("User",userSchema)