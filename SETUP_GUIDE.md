# Complete Setup Guide: MongoDB Atlas + AWS S3

## 🗄️ MongoDB Atlas Setup (Required for Production)

### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Click "Try Free" 
3. Create account (no credit card required)

### Step 2: Create Free Cluster
1. Choose **FREE** tier (M0)
2. Select cloud provider (AWS/Google Cloud/Azure)
3. Choose region closest to you
4. Click "Create"

### Step 3: Database Access
1. Go to "Database Access" → "Add New Database User"
2. Create username/password (save these!)
3. Select "Read and write to any database"
4. Click "Add User"

### Step 4: Network Access
1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (for Render)
3. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your actual password

**Example connection string:**
```
mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/blogapp?retryWrites=true&w=majority
```

---

## ☁️ AWS S3 Setup (For Image Storage)

### Step 1: Create AWS Account
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Create account (requires credit card, but S3 free tier is generous)

### Step 2: Create S3 Bucket
1. Go to S3 Console
2. Click "Create bucket"
3. Enter unique bucket name (e.g., `myblogapp-images-2024`)
4. Choose region (same as your app)
5. **IMPORTANT:** Keep "Block all public access" **CHECKED**
6. Click "Create bucket"

### Step 3: Create IAM User
1. Go to IAM Console → "Users" → "Add user"
2. Enter username (e.g., `blogapp-s3-user`)
3. Select "Programmatic access"
4. Click "Next"

### Step 4: Attach Permissions
1. Click "Attach existing policies directly"
2. Search for "AmazonS3FullAccess"
3. Check the box and click "Next"
4. Click "Create user"

### Step 5: Get Access Keys
1. Click on your new user
2. Go to "Security credentials" tab
3. Click "Create access key"
4. Choose "Application running outside AWS"
5. Copy **Access Key ID** and **Secret Access Key**

---

## 🔧 Environment Variables Setup

### Local Development (.env file)
```env
PORT=8000
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/blogapp?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

### Render Deployment
1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Add all the above environment variables

---

## 📦 Install Dependencies

```bash
npm install
```

This will install:
- `aws-sdk` - AWS SDK for S3
- `multer-s3` - Multer storage engine for S3
- All other existing dependencies

---

## 🚀 Test Your Setup

### 1. Test MongoDB Connection
```bash
npm run dev
```
Check console for MongoDB connection success.

### 2. Test S3 Upload
1. Create a new blog post
2. Upload an image
3. Check if image appears correctly
4. Verify image URL points to S3

### 3. Test Image Deletion
1. Delete a blog post with an image
2. Verify image is removed from S3

---

## 🔍 Troubleshooting

### MongoDB Connection Issues
- Check connection string format
- Verify username/password
- Ensure network access allows your IP
- Check if cluster is active

### S3 Upload Issues
- Verify AWS credentials
- Check bucket name spelling
- Ensure bucket region matches AWS_REGION
- Verify IAM user has S3 permissions

### Common Errors
- `MongoServerSelectionError`: Check MongoDB connection string
- `AccessDenied`: Check AWS credentials and permissions
- `NoSuchBucket`: Check bucket name and region

---

## 💰 Cost Information

### MongoDB Atlas (Free Tier)
- 512MB storage
- Shared clusters
- No credit card required
- Perfect for small apps

### AWS S3 (Free Tier)
- 5GB storage
- 20,000 GET requests/month
- 2,000 PUT requests/month
- Very generous for blog images

---

## 🎯 Next Steps

1. **Deploy to Render** with new environment variables
2. **Test all functionality** (create, read, delete blogs)
3. **Monitor usage** in AWS and MongoDB dashboards
4. **Set up alerts** for usage limits

Your app will now have persistent image storage and a reliable database! 🎉 