const { Router } = require("express");
const Blog = require("../model/blogs");
const Comment = require("../model/comments");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const path = require("path");
const fs = require("fs");
const router = Router();

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
    if (!req.user) {
        return res.redirect("/user/signin");
    }
    next();
};

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Configure multer for S3 upload
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        // Remove ACL since bucket has ACLs disabled
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const fileName = `blogs/${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    fileFilter: function (req, file, cb) {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Function to delete image from S3
const deleteImageFromS3 = async (imageUrl) => {
    if (!imageUrl || imageUrl === '/images/default.avif' || !imageUrl.includes('amazonaws.com')) {
        return;
    }
    
    try {
        const key = imageUrl.split('.com/')[1];
        await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        }).promise();
    } catch (error) {
        console.error('Error deleting image from S3:', error);
    }
};

router.get("/add-new", authenticateUser, (req, res) => {
    return res.render("addblog", { user: req.user });
});

router.post("/", authenticateUser, upload.single("coverImage"), async (req, res) => {
    try {
        const { title, body } = req.body;
        let coverImageUrl = "/images/default.avif";
        
        console.log("File upload info:", req.file);
        
        if (req.file) {
            coverImageUrl = req.file.location; // S3 URL
            console.log("S3 URL:", coverImageUrl);
        }
        
        const blog = await Blog.create({
            title,
            body,
            createdBy: req.user._id,
            coverImageUrl
        });
        
        console.log("Blog created:", blog);
        
        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error("Blog creation error:", error);
        return res.status(400).render("addblog", {
            user: req.user,
            error: "Error creating blog post"
        });
    }
});

router.get("/:_id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params._id).populate({
            path: 'createdBy',
            select: 'fullName profileImage'
        });

        if (!blog) {
            return res.status(404).render("error", {
                user: req.user,
                error: "Blog post not found"
            });
        }

        // Set default values if createdBy is null
        if (!blog.createdBy) {
            blog.createdBy = {
                fullName: "Anonymous",
                profileImage: "/images/default.avif"
            };
        }

        const comments = await Comment.find({ blogId: blog._id })
            .populate('createdBy', 'fullName profileImage')
            .sort("-createdAt");

        return res.render("blog", {
            user: req.user,
            blog,
            comments: comments || []
        });
    } catch (error) {
        console.error("Blog fetch error:", error);
        return res.status(500).render("error", {
            user: req.user,
            error: "Error fetching blog post"
        });
    }
});

// Delete blog post
router.post("/:_id/delete", authenticateUser, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params._id);
        
        if (!blog) {
            return res.status(404).render("error", { 
                user: req.user,
                error: "Blog post not found"
            });
        }

        // Check if the current user is the blog author
        if (blog.createdBy.toString() !== req.user._id) {
            return res.status(403).render("error", {
                user: req.user,
                error: "You are not authorized to delete this blog post"
            });
        }

        // Delete image from S3 if it exists
        if (blog.coverImageUrl && blog.coverImageUrl !== '/images/default.avif') {
            await deleteImageFromS3(blog.coverImageUrl);
        }

        // Delete all comments associated with the blog
        await Comment.deleteMany({ blogId: blog._id });

        // Delete the blog post
        await Blog.findByIdAndDelete(req.params._id);

        return res.redirect("/");
    } catch (error) {
        console.error("Blog deletion error:", error);
        return res.status(500).render("error", {
            user: req.user,
            error: "Error deleting blog post"
        });
    }
});

module.exports = router;