const mongoose = require('mongoose')
const{ObjectId} = mongoose.Schema.Types

const postSchema = new mongoose.Schema({

    body:{
        type: String
    },
    photo:{
        type:String,
        required: true
    },
    likes:[{
        type:ObjectId,
        ref:"User"
    }],
    // likesCount: {
    //     type: Number,
    //     default: 0,
    //   },
    comments:[{
        text:String,
        postedBy:{type:ObjectId,ref:"User"}
        
    }],
    postedBy: {
        type: ObjectId,
        ref: "User"
    }
},{timestamps: true})

mongoose.model("Post",postSchema)