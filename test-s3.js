require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

async function testS3Configuration() {
    console.log('🔍 Testing AWS S3 Configuration...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
    console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
    console.log('AWS_REGION:', process.env.AWS_REGION || '❌ Missing');
    console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || '❌ Missing');
    console.log('');
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || 
        !process.env.AWS_REGION || !process.env.AWS_S3_BUCKET_NAME) {
        console.log('❌ Missing required environment variables!');
        console.log('Please check your .env file and ensure all AWS variables are set.');
        return;
    }
    
    try {
        // Test bucket access
        console.log('🔗 Testing bucket access...');
        await s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET_NAME }).promise();
        console.log('✅ Bucket access successful!');
        
        // List objects in bucket
        console.log('\n📁 Listing bucket contents...');
        const objects = await s3.listObjectsV2({ 
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            MaxKeys: 10 
        }).promise();
        
        if (objects.Contents && objects.Contents.length > 0) {
            console.log('✅ Found objects in bucket:');
            objects.Contents.forEach(obj => {
                console.log(`  - ${obj.Key} (${obj.Size} bytes)`);
            });
        } else {
            console.log('ℹ️ Bucket is empty (this is normal for new buckets)');
        }
        
        // Test upload permissions
        console.log('\n📤 Testing upload permissions...');
        const testKey = `test-${Date.now()}.txt`;
        const testContent = 'This is a test file to verify S3 upload permissions.';
        
        await s3.putObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain'
        }).promise();
        
        console.log('✅ Upload test successful!');
        
        // Clean up test file
        await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: testKey
        }).promise();
        
        console.log('✅ Test file cleaned up successfully!');
        
        console.log('\n🎉 S3 Configuration is working correctly!');
        console.log('Your user images should upload successfully to S3.');
        
    } catch (error) {
        console.log('\n❌ S3 Configuration Error:');
        console.log('Error:', error.message);
        
        if (error.code === 'AccessDenied') {
            console.log('\n💡 Possible solutions:');
            console.log('1. Check if your AWS credentials are correct');
            console.log('2. Verify your IAM user has S3 permissions');
            console.log('3. Ensure the bucket name is correct');
            console.log('4. Check if the bucket region matches AWS_REGION');
        } else if (error.code === 'NoSuchBucket') {
            console.log('\n💡 Possible solutions:');
            console.log('1. Check if the bucket name is spelled correctly');
            console.log('2. Verify the bucket exists in the specified region');
            console.log('3. Ensure you have access to the bucket');
        }
    }
}

// Run the test
testS3Configuration(); 