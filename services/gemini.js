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
        console.error("Error getting chat response from Gemini:", error);
        throw new Error("Failed to get response from AI service.");
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
        console.error("Error getting chat response with history from Gemini:", error);
        throw new Error("Failed to get response from AI service.");
    }
}

module.exports = {
    buildBlogContext,
    buildSystemPrompt,
    getChatResponse,
    getChatResponseWithHistory,
}; 