const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// Configure multer for S3 upload
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        acl: 'public-read',
        key: function (req, file, cb) {
            // Generate unique filename
            const fileName = `blog-images/${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        },
        contentType: function (req, file, cb) {
            cb(null, file.mimetype);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

/**
 * Delete an image from S3
 * @param {string} imageUrl - The full S3 URL of the image
 * @returns {Promise<boolean>} - Success status
 */
async function deleteImageFromS3(imageUrl) {
    try {
        if (!imageUrl || !imageUrl.includes('amazonaws.com')) {
            return false; // Not an S3 URL
        }

        // Extract key from URL
        const urlParts = imageUrl.split('/');
        const key = urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com/

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        };

        await s3.deleteObject(params).promise();
        return true;
    } catch (error) {
        console.error('Error deleting image from S3:', error);
        return false;
    }
}

/**
 * Get a presigned URL for uploading (if needed for direct uploads)
 * @param {string} fileName - Name of the file
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<string>} - Presigned URL
 */
async function getPresignedUrl(fileName, fileType) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `blog-images/${Date.now()}-${fileName}`,
        ContentType: fileType,
        Expires: 300 // 5 minutes
    };

    return s3.getSignedUrl('putObject', params);
}

module.exports = {
    upload,
    deleteImageFromS3,
    getPresignedUrl
}; 