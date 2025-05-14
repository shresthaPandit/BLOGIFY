const mongoose = require("mongoose");

const  blogSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true},
    body:{
        type:String,
        required:true},
    coverImageUrl:{
        type:String,
        required:false,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    }
    ,
    },{timestamps:true}

);

const blog=mongoose.model("blog",blogSchema);
module.exports=blog;