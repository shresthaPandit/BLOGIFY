const { Router } = require("express");
const { handleSendMessage, handleGetSystemInfo } = require("../controllers/chatController");
const { checkForAuthenticationCookie } = require("../middlewares/authentication");

const router = Router();

// POST /api/chat
router.post("/", checkForAuthenticationCookie("token"), handleSendMessage);

// GET /api/chat/info
router.get("/info", handleGetSystemInfo);

module.exports = router; 