require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const blog = require("./model/blogs");
const path = require("path");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();

// Environment variables
const PORT = process.env.PORT || 8001;
const MONGODB_URI = process.env.MONGODB_URI;

// Security middleware
app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("./public")));

const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const commentRoutes = require("./routes/comment");
const chatRoutes = require("./routes/chat");

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.set("view engine", 'ejs');
app.set("views", path.resolve("./views"));

app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.json());

app.get("/", async (req, res) => {
    try {
        const allBlogs = await blog.find({}).populate({
            path: 'createdBy',
            select: 'fullName profileImage'
        }).sort("-createdAt");
        
        console.log("Blogs found:", allBlogs.map(b => ({
            title: b.title,
            coverImageUrl: b.coverImageUrl,
            coverImage: b.coverImage
        })));
        
        res.render("home", { user: req.user, blogs: allBlogs });
    } catch (error) {
        console.error("Home page error:", error);
        res.status(500).render("error", {
            user: req.user,
            error: "Error loading blog posts"
        });
    }
});

app.use("/user", userRoutes);
app.use("/blog", blogRoutes);
app.use("/comment", commentRoutes);
app.use("/api/chat", chatRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));