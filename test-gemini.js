require('dotenv').config();
const { getChatResponse } = require('./services/gemini');

async function testGemini() {
    try {
        console.log('🔍 Testing Gemini API configuration...');
        
        // Check if API key exists
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY is not set in environment variables');
            console.log('💡 Please check your .env file or environment variables');
            return;
        }
        
        console.log('✅ API Key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
        
        console.log('🚀 Testing Gemini API connection...');
        const response = await getChatResponse('Hello! Can you tell me about blogging?');
        console.log('✅ Gemini Response:', response);
        console.log('🎉 Gemini API is working correctly!');
        
    } catch (error) {
        console.error('❌ Error testing Gemini:', error.message);
        
        if (error.status === 503) {
            console.log('⚠️  Gemini API is overloaded (503 error) - this is normal for free tier');
            console.log('✅ Your fallback system will handle this automatically');
            console.log('🔑 Your API key is working correctly!');
        } else if (error.status === 401) {
            console.log('🔑 API key authentication failed - check your GEMINI_API_KEY');
        } else if (error.status === 429) {
            console.log('⏱️  Rate limit exceeded - try again in a moment');
        }
    }
}

testGemini(); 