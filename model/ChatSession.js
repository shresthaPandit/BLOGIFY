const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, { _id: false, timestamps: true });

const chatSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false, // Allow for anonymous chats
    },
    messages: [messageSchema],
}, { timestamps: true });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);

module.exports = ChatSession; 