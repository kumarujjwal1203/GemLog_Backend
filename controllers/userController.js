import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../utils/sendEmail.js";
import fs from "fs";
import path from "path";

export async function onRegister(req, res) {
  try {
    const { email, username, password } = req.body;
    console.log("📥 Registration Data:", req.body); // helpful for debugging

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Email, username and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (username.length < 3 || username.length > 30) {
      return res
        .status(400)
        .json({ message: "Username must be between 3 and 30 characters" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "Email already exists"
            : "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, username, passwordhash: hashedPassword });
    const result = await user.save();

    // ✅ Optional: Disable in dev
    await sendMail(email);

    res.status(201).json({
      message: "User registered successfully",
      user: { email: result.email, username: result.username, _id: result._id },
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res
      .status(500)
      .json({ message: "Failed to register user", error: err.message });
  }
}

// POST /login
export async function onLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordhash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret_key",
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        email: user.email,
        username: user.username,
        _id: user._id,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Failed to login", error: err.message });
  }
}

// GET /profile
export async function getUserProfile(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .select("-passwordhash")
      .populate("followers", "email username profilePicture")
      .populate("following", "email username profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res
      .status(500)
      .json({ message: "Failed to get profile", error: err.message });
  }
}

// PUT /profile
export async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, email } = req.body;

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    await user.save();
    res.json({
      message: "Profile updated successfully",
      user: {
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        _id: user._id,
      },
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
}

// POST /profile-picture
export async function uploadProfilePicture(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profilePicture) {
      const oldImagePath = path.join(
        process.cwd(),
        "uploads",
        path.basename(user.profilePicture)
      );
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    user.profilePicture = imageUrl;
    await user.save();

    res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: imageUrl,
    });
  } catch (err) {
    console.error("❌ Upload profile picture error:", err);
    res.status(500).json({
      message: "Failed to upload profile picture",
      error: err.message,
    });
  }
}

// DELETE /profile-picture
export async function deleteProfilePicture(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.profilePicture) {
      return res.status(400).json({ message: "No profile picture to delete" });
    }

    const imagePath = path.join(
      process.cwd(),
      "uploads",
      path.basename(user.profilePicture)
    );
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    user.profilePicture = null;
    await user.save();

    res.json({ message: "Profile picture deleted successfully" });
  } catch (err) {
    console.error("❌ Delete profile picture error:", err);
    res.status(500).json({
      message: "Failed to delete profile picture",
      error: err.message,
    });
  }
}

// POST /follow/:userId
export async function followUser(req, res) {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    if (currentUserId.toString() === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetUserId),
      User.findById(currentUserId),
    ]);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ message: "User followed successfully" });
  } catch (err) {
    console.error("❌ Follow user error:", err);
    res
      .status(500)
      .json({ message: "Failed to follow user", error: err.message });
  }
}

// POST /unfollow/:userId
export async function unfollowUser(req, res) {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    if (currentUserId.toString() === targetUserId) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetUserId),
      User.findById(currentUserId),
    ]);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    currentUser.following.pull(targetUserId);
    targetUser.followers.pull(currentUserId);

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ message: "User unfollowed successfully" });
  } catch (err) {
    console.error("❌ Unfollow user error:", err);
    res
      .status(500)
      .json({ message: "Failed to unfollow user", error: err.message });
  }
}

// GET /:userId
export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.userId)
      .select("-passwordhash")
      .populate("followers", "email username profilePicture")
      .populate("following", "email username profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Get user by ID error:", err);
    res.status(500).json({ message: "Failed to get user", error: err.message });
  }
}

// GET /search?q=...
export async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    const currentUserId = req.user._id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      username: { $regex: q.trim(), $options: "i" },
      _id: { $ne: currentUserId },
    })
      .select("username email profilePicture")
      .limit(10);

    const currentUser = await User.findById(currentUserId).select("following");
    const followingIds = new Set(
      currentUser.following.map((id) => id.toString())
    );

    const usersWithFollowStatus = users.map((user) => ({
      ...user.toObject(),
      isFollowing: followingIds.has(user._id.toString()),
    }));

    res.json(usersWithFollowStatus);
  } catch (err) {
    console.error("❌ Search users error:", err);
    res
      .status(500)
      .json({ message: "Failed to search users", error: err.message });
  }
}

// GET /:userId/followers
export async function getUserFollowers(req, res) {
  try {
    const user = await User.findById(req.params.userId)
      .populate("followers", "username email profilePicture")
      .select("followers");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ followers: user.followers });
  } catch (err) {
    console.error("❌ Get user followers error:", err);
    res
      .status(500)
      .json({ message: "Failed to get followers", error: err.message });
  }
}

// GET /:userId/following
export async function getUserFollowing(req, res) {
  try {
    const user = await User.findById(req.params.userId)
      .populate("following", "username email profilePicture")
      .select("following");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ following: user.following });
  } catch (err) {
    console.error("❌ Get user following error:", err);
    res
      .status(500)
      .json({ message: "Failed to get following", error: err.message });
  }
}
