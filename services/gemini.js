const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Builds a context string from a blog object to be used in an AI prompt.
 * @param {object} blog - The blog object from your database.
 * @returns {string} A formatted string containing the blog's title, author, date, and body.
 */
function buildBlogContext(blog) {
    if (!blog || !blog.title || !blog.body) {
        return "";
    }
    const author = blog.createdBy?.fullName || "Anonymous";
    const date = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "";
    return `Blog Title: "${blog.title}"
Author: ${author}
Date: ${date}

Blog Content:
${blog.body}

---`;
}

/**
 * Builds a system prompt for the chatbot's personality and style.
 * @returns {string} The system prompt.
 */
function buildSystemPrompt() {
    return "You are Blogify's friendly assistant. Answer in a warm, encouraging, and creative tone. Use blog context if provided. Suggest posts if asked. If a user asks for writing tips, offer helpful advice.";
}

/**
 * Gets a direct response from the Gemini API based on a single prompt.
 * @param {string} prompt - The user's prompt.
 * @returns {Promise<string>} The AI's response text.
 */
async function getChatResponse(prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        // Handle specific Gemini API errors
        if (error.status === 503) {
            throw { status: 503, message: "The AI service is currently overloaded. Please try again in a few moments." };
        } else if (error.status === 429) {
            throw { status: 429, message: "Rate limit exceeded. Please wait a moment before trying again." };
        } else if (error.status === 401) {
            throw { status: 401, message: "API key authentication failed. Please check your configuration." };
        }
        
        throw { status: 500, message: "Failed to get response from AI service." };
    }
}

/**
 * Gets a response from the Gemini API based on a conversation history and optional blog context.
 * @param {Array<object>} messages - An array of message objects (e.g., [{ role: 'user', content: '...' }]).
 * @param {string} blogContext - Optional blog context string.
 * @returns {Promise<object>} The AI's response message object.
 */
async function getChatResponseWithHistory(messages, blogContext = "") {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Build the full prompt with system message and context
        const systemPrompt = buildSystemPrompt();
        let fullPrompt = systemPrompt;
        
        if (blogContext) {
            fullPrompt += "\n\nBlog Context:\n" + blogContext;
        }
        
        fullPrompt += "\n\nConversation:\n";
        
        // Add conversation history
        messages.forEach(msg => {
            fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        
        return {
            role: 'assistant',
            content: response.text()
        };
    } catch (error) {
        // Handle specific Gemini API errors
        if (error.status === 503) {
            throw { status: 503, message: "The AI service is currently overloaded. Please try again in a few moments." };
        } else if (error.status === 429) {
            throw { status: 429, message: "Rate limit exceeded. Please wait a moment before trying again." };
        } else if (error.status === 401) {
            throw { status: 401, message: "API key authentication failed. Please check your configuration." };
        }
        
        throw { status: 500, message: "Failed to get response from AI service." };
    }
}

/**
 * Provides a fallback response when Gemini API is unavailable
 * @param {string} userMessage - The user's message
 * @returns {object} A fallback response message object
 */
function getFallbackResponse(userMessage) {
    const fallbackResponses = {
        greeting: "Hello! I'm Blogify's assistant. I'm currently experiencing some technical difficulties, but I'm here to help with your blog-related questions when I'm back online!",
        writing: "I'd love to help with writing tips! Unfortunately, I'm temporarily unavailable due to high demand. Please try again in a few minutes, or feel free to explore our blog posts for inspiration!",
        blog: "I can help you find and discuss blog posts! I'm currently experiencing some technical issues, but I'll be back to assist you shortly. In the meantime, you can browse our blog section!",
        default: "I'm sorry, but I'm currently experiencing technical difficulties. Please try again in a few moments, or contact support if the issue persists."
    };

    const message = userMessage.toLowerCase();
    
    if (/hello|hi|hey|greetings/i.test(message)) {
        return { role: 'assistant', content: fallbackResponses.greeting };
    } else if (/write|writing|tip|advice|help/i.test(message)) {
        return { role: 'assistant', content: fallbackResponses.writing };
    } else if (/blog|post|article|content/i.test(message)) {
        return { role: 'assistant', content: fallbackResponses.blog };
    } else {
        return { role: 'assistant', content: fallbackResponses.default };
    }
}

module.exports = {
    buildBlogContext,
    buildSystemPrompt,
    getChatResponse,
    getChatResponseWithHistory,
    getFallbackResponse,
}; 