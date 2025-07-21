import express from "express";
import { onRegister, onLogin, getUserProfile, updateProfile, uploadProfilePicture, deleteProfilePicture, followUser, unfollowUser, getUserById, searchUsers, getUserFollowers, getUserFollowing } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", onRegister);
router.post("/login", onLogin);

// Public routes for user profiles (these should come before dynamic routes)
router.get("/:userId/followers", getUserFollowers);
router.get("/:userId/following", getUserFollowing);

// Protected routes - specific routes first
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile-picture", authMiddleware, upload.single('profilePicture'), uploadProfilePicture);
router.delete("/profile-picture", authMiddleware, deleteProfilePicture);
router.get("/search", authMiddleware, searchUsers);
router.post("/follow/:userId", authMiddleware, followUser);
router.post("/unfollow/:userId", authMiddleware, unfollowUser);

// Dynamic routes - these should come last
router.get("/:userId", getUserById);

export default router;
