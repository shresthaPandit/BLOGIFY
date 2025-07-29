const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    coverImage: { 
        type: String, 
        default: "/images/default.avif" 
    },
    coverImageUrl: { 
        type: String, 
        default: "/images/default.avif" 
    }
}, { timestamps: true });

const Blog = mongoose.model("blog", blogSchema);

module.exports = Blog;