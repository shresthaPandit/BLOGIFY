const os = require('os');
const { getChatResponse, getChatResponseWithHistory, buildBlogContext } = require('../services/gemini');
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

        // Blog-aware context: if the message contains 'blog', try to find relevant blogs
        let blogContext = "";
        if (/blog|post|article|story|write|author|recommend|suggest|tip|advice/i.test(message)) {
            // Search for relevant blogs by keyword in title or body
            const keyword = message.split(" ").slice(-1)[0]; // crude keyword extraction
            const blogs = await Blog.find({
                $or: [
                    { title: { $regex: keyword, $options: "i" } },
                    { body: { $regex: keyword, $options: "i" } }
                ]
            }).populate("createdBy").sort("-createdAt").limit(2);
            if (blogs.length > 0) {
                blogContext = blogs.map(buildBlogContext).join("\n");
            }
        }

        const aiResponse = await getChatResponseWithHistory(historyForAI, blogContext);
        session.messages.push(aiResponse);
        await session.save();

        return res.json({ response: aiResponse.content });
    } catch (error) {
        console.error("Error in chat controller:", error);
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