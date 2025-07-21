import express from "express";
import {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  getCommentReplies,
  createReply,
} from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/post/:postId", getCommentsByPost);

router.post("/", authMiddleware, createComment);

router.post("/:commentId/reply", authMiddleware, createReply);

router.get("/:commentId/replies", getCommentReplies);

router.put("/:id", authMiddleware, updateComment);

router.delete("/:id", authMiddleware, deleteComment);

export default router;
