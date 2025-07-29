const os = require('os');
const { getChatResponse, getChatResponseWithHistory, buildBlogContext, getFallbackResponse } = require('../services/gemini');
const ChatSession = require('../model/ChatSession');
const Blog = require('../model/blogs');

async function handleSendMessage(req, res) {
    const { message, sessionId } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId are required." });
    }

    try {
        let session = await ChatSession.findOne({ sessionId });
        if (!session) {
            session = new ChatSession({ sessionId, userId, messages: [] });
        }

        session.messages.push({ role: 'user', content: message });
        const historyForAI = session.messages.map(msg => ({ role: msg.role, content: msg.content }));

        // Optimized blog context: only search if explicitly requested or if message contains specific keywords
        let blogContext = "";
        const blogKeywords = /blog|post|article|story|write|author|recommend|suggest|tip|advice|read|content/i;
        const explicitRequest = /show.*blog|find.*blog|search.*blog|blog.*about|posts.*about/i;
        
        if (explicitRequest.test(message) || (blogKeywords.test(message) && message.length > 20)) {
            // Extract more meaningful keywords from the message
            const words = message.toLowerCase().split(/\s+/).filter(word => 
                word.length > 3 && !['what', 'when', 'where', 'which', 'this', 'that', 'with', 'have', 'will', 'been', 'they', 'from', 'your', 'know', 'want', 'tell', 'give', 'show', 'find', 'help'].includes(word)
            );
            
            if (words.length > 0) {
                // Use the most relevant word for search
                const searchTerm = words[0];
                const blogs = await Blog.find({
                    $or: [
                        { title: { $regex: searchTerm, $options: "i" } },
                        { body: { $regex: searchTerm, $options: "i" } }
                    ]
                }).populate("createdBy").sort("-createdAt").limit(1); // Reduced to 1 for faster response
                
                if (blogs.length > 0) {
                    blogContext = blogs.map(buildBlogContext).join("\n");
                }
            }
        }

        let aiResponse;
        try {
            aiResponse = await getChatResponseWithHistory(historyForAI, blogContext);
        } catch (error) {
            // If Gemini API is overloaded, use fallback response
            if (error.status === 503 || error.status === 429) {
                console.log("✅ Using fallback response - Gemini API is temporarily overloaded");
                aiResponse = getFallbackResponse(message);
            } else {
                throw error; // Re-throw other errors
            }
        }

        session.messages.push(aiResponse);
        await session.save();

        return res.json({ response: aiResponse.content });
    } catch (error) {
        console.error("❌ Chat error:", error.message || error);
        
        // Handle specific error types
        if (error.status === 503) {
            return res.status(503).json({ error: "The AI server is overloaded. Please try again in a few moments." });
        } else if (error.status === 429) {
            return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment before trying again." });
        } else if (error.status === 401) {
            return res.status(401).json({ error: "API authentication failed. Please check your configuration." });
        }
        
        return res.status(500).json({ error: "Failed to get response from AI." });
    }
}

async function handleGetSystemInfo(req, res) {
    const systemInfo = {
        platform: os.platform(),
        cpuCores: os.cpus().length,
        totalMemory: `${(os.totalmem() / 1e9).toFixed(2)} GB`,
        freeMemory: `${(os.freemem() / 1e9).toFixed(2)} GB`,
    };
    return res.json(systemInfo);
}

module.exports = {
    handleSendMessage,
    handleGetSystemInfo,
}; 