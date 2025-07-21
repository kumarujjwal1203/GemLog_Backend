import express from "express";
import {
  getAllPosts,
  getUserPosts,
  getPostsByUserId,
  getSinglePost,
  createPost,
  updatePost,
  deletePost,
  deletePostImage,
  likePost,
  unlikePost,
  dislikePost,
  undislikePost,
} from "../controllers/postController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllPosts);

router.get("/user/posts", authMiddleware, getUserPosts);
router.post("/", authMiddleware, upload.array("images", 5), createPost);

router.get("/user/:userId", getPostsByUserId);
router.get("/:id", getSinglePost);
router.put("/:id", authMiddleware, upload.array("images", 5), updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.delete("/:id/images/:imageIndex", authMiddleware, deletePostImage);
router.post("/:id/like", authMiddleware, likePost);
router.post("/:id/unlike", authMiddleware, unlikePost);
router.post("/:id/dislike", authMiddleware, dislikePost);
router.post("/:id/undislike", authMiddleware, undislikePost);

export default router;
