const { getChatResponse } = require('./services/gemini');

async function testGemini() {
    try {
        console.log('Testing Gemini API integration...');
        const response = await getChatResponse('Hello! Can you tell me about blogging?');
        console.log('Gemini Response:', response);
        console.log('✅ Gemini integration is working correctly!');
    } catch (error) {
        console.error('❌ Error testing Gemini:', error.message);
    }
}

testGemini(); 