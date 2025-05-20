const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../model/blogs");
const Comment = require("../model/comments");
const fs = require('fs').promises;
const router = Router();

// Ensure upload directories exist
const createUploadDirs = async () => {
    const uploadDir = path.resolve("./public/uploads");
    try {
        await fs.access(uploadDir);
    } catch {
        // Directory doesn't exist, create it
        await fs.mkdir(uploadDir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        await createUploadDirs(); // Ensure directory exists
        cb(null, path.resolve("./public/uploads"));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
    if (!req.user) {
        return res.redirect("/user/signin");
    }
    next();
};

router.get("/add-new", authenticateUser, (req, res) => {
    return res.render("addblog", { user: req.user });
});

router.post("/", authenticateUser, upload.single("file"), async (req, res) => {
    try {
        const { title, body } = req.body;
        if (!req.file) {
            return res.status(400).render("addblog", {
                user: req.user,
                error: "Please upload a cover image"
            });
        }
        const blog = await Blog.create({
            title,
            body,
            createdBy: req.user._id,
            coverImageUrl: `uploads/${req.file.filename}`
        });
        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        // If there's an error and a file was uploaded, delete it
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error("Error deleting uploaded file:", unlinkError);
            }
        }
        
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

        // Delete the cover image file
        if (blog.coverImageUrl) {
            try {
                await fs.unlink(path.resolve(`./public/${blog.coverImageUrl}`));
            } catch (err) {
                console.error("Error deleting cover image:", err);
            }
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