const { Router } = require("express");
const router = Router();
const Comment = require("../model/comments");

router.post("/:blogId", async (req, res) => {
    try {
        const { content } = req.body;
        const { blogId } = req.params;

        if (!req.user) {
            return res.redirect("/user/signin");
        }

        await Comment.create({
            content,
            blogId,
            createdBy: req.user._id
        });

        return res.redirect(`/blog/${blogId}`);
    } catch (error) {
        console.error("Comment creation error:", error);
        return res.redirect(`/blog/${req.params.blogId}`);
    }
});

module.exports = router; 