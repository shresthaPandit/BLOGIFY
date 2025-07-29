const { Router } = require("express");
const router = Router();
const User = require("../model/users");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Configure multer for S3 upload (profile images)
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const fileName = `profiles/${Date.now()}-${file.originalname}`;
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

// Function to delete profile image from S3
const deleteProfileImageFromS3 = async (imageUrl) => {
    if (!imageUrl || imageUrl === '/images/default.avif' || !imageUrl.includes('amazonaws.com')) {
        return;
    }
    
    try {
        const key = imageUrl.split('.com/')[1];
        await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        }).promise();
        console.log('✅ Profile image deleted from S3:', imageUrl);
    } catch (error) {
        console.error('❌ Error deleting profile image from S3:', error);
    }
};

router.get("/signin", (req, res) => {
    return res.render("signin");
});

router.get("/signup", (req, res) => {
    return res.render("signup");
});

router.post("/signup", upload.single("profileImage"), async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        let profileImageUrl = '/images/default.avif';
        
        if (req.file) {
            profileImageUrl = req.file.location; // S3 URL
            console.log("✅ New user profile image uploaded to S3:", profileImageUrl);
        }
        
        const userData = {
            fullName,
            email,
            password,
            profileImage: profileImageUrl
        };

        await User.create(userData);
        console.log("✅ New user created with S3 profile image");
        return res.redirect("/user/signin");
    } catch (error) {
        // If there's an error and a file was uploaded, delete it from S3
        if (req.file) {
            try {
                await deleteProfileImageFromS3(req.file.location);
            } catch (deleteError) {
                console.error("❌ Error deleting uploaded file from S3:", deleteError);
            }
        }
        
        console.error("❌ Signup error:", error);
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