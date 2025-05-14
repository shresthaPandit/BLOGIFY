const { Router } = require("express");
const router = Router();
const User = require("../model/users");
const multer = require("multer");
const path = require("path");
const fs = require('fs').promises;

// Ensure upload directories exist
const createUploadDirs = async () => {
    const uploadDir = path.resolve("./public/uploads/profiles");
    try {
        await fs.access(uploadDir);
    } catch {
        // Directory doesn't exist, create it
        await fs.mkdir(uploadDir, { recursive: true });
    }
};

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        await createUploadDirs(); // Ensure directory exists
        cb(null, path.resolve("./public/uploads/profiles"));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

router.get("/signin", (req, res) => {
    return res.render("signin");
});

router.get("/signup", (req, res) => {
    return res.render("signup");
});

router.post("/signup", upload.single("profileImage"), async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        const userData = {
            fullName,
            email,
            password,
            profileImage: req.file ? `/uploads/profiles/${req.file.filename}` : '/images/default.avif'
        };

        await User.create(userData);
        return res.redirect("/user/signin");
    } catch (error) {
        // If there's an error and a file was uploaded, delete it
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error("Error deleting uploaded file:", unlinkError);
            }
        }
        
        console.error("Signup error:", error);
        return res.render("signup", {
            error: "Error creating account. Please try again."
        });
    }
});

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await User.matchPasswordAndGenerateToken(email, password);
        return res.cookie("token", token).redirect("/");
    } catch (error) {
        return res.render("signin", {
            error: "Invalid email or password"
        });
    }
});

router.get("/logout", (req, res) => {
    return res.clearCookie("token").redirect("/");
});

module.exports = router;