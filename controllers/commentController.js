import Comment from "../models/Comment.js";

// Get all comments for a post (including replies)
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Get top-level comments (not replies)
    const topLevelComments = await Comment.find({ 
      postId, 
      parentCommentId: null,
      isDeleted: false 
    })
      .populate("userId", "email username profilePicture")
      .populate({
        path: "replies",
        match: { isDeleted: false },
        populate: [
          {
            path: "userId",
            select: "email username profilePicture"
          },
          {
            path: "replies",
            match: { isDeleted: false },
            populate: [
              {
                path: "userId",
                select: "email username profilePicture"
              },
              {
                path: "replies",
                match: { isDeleted: false },
                populate: {
                  path: "userId",
                  select: "email username profilePicture"
                }
              }
            ]
          }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(topLevelComments);
  } catch (error) {
    res.status(500).json({ message: "Failed to get comments", error: error.message });
  }
};

// Create a comment on a post (or reply to another comment)
export const createComment = async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    const userId = req.user._id; // from auth middleware

    if (!content || !postId) {
      return res.status(400).json({ message: "Content and postId are required" });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content cannot be empty" });
    }

    // If this is a reply, verify the parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.isDeleted) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const comment = new Comment({ 
      postId, 
      userId, 
      content: content.trim(),
      parentCommentId: parentCommentId || null
    });
    const savedComment = await comment.save();
    
    // If this is a reply, add it to the parent comment's replies array
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: savedComment._id }
      });
    }
    
    // Populate the user data for the response
    const populatedComment = await Comment.findById(savedComment._id)
      .populate("userId", "email username profilePicture");

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create comment", error: error.message });
  }
};

// Update a comment by id
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    console.log(`Updating comment ${id} by user ${userId} with content: ${content}`);

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content cannot be empty" });
    }

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      console.log(`Comment ${id} not found or already deleted`);
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user owns the comment
    if (!comment.userId || !userId || !comment.userId.equals(userId)) {
      console.log(`User ${userId} not authorized to update comment ${id}`);
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    comment.content = content.trim();
    const updatedComment = await comment.save();
    
    // Populate the user data for the response
    const populatedComment = await Comment.findById(updatedComment._id)
      .populate("userId", "email username profilePicture");

    console.log(`Comment ${id} updated successfully`);
    res.json(populatedComment);
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Failed to update comment", error: error.message });
  }
};

// Soft delete a comment by id and all its replies
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log(`Deleting comment ${id} by user ${userId}`);

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      console.log(`Comment ${id} not found or already deleted`);
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user owns the comment
    if (!comment.userId || !userId || !comment.userId.equals(userId)) {
      console.log(`User ${userId} not authorized to delete comment ${id}`);
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Soft delete the comment
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.content = "[This comment has been deleted]";
    await comment.save();

    // Soft delete all replies to this comment
    if (comment.replies && comment.replies.length > 0) {
      console.log(`Deleting ${comment.replies.length} replies to comment ${id}`);
      await Comment.updateMany(
        { _id: { $in: comment.replies } },
        {
          isDeleted: true,
          deletedAt: new Date(),
          content: "[This reply has been deleted]"
        }
      );
    }

    console.log(`Comment ${id} and all replies deleted successfully`);
    res.json({ message: "Comment and all replies deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Failed to delete comment", error: error.message });
  }
};

// Get replies for a specific comment
export const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const replies = await Comment.find({
      _id: { $in: comment.replies },
      isDeleted: false
    })
      .populate("userId", "email username profilePicture")
      .sort({ createdAt: 1 });

    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: "Failed to get replies", error: error.message });
  }
};

// Create a reply to a comment
export const createReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Reply content cannot be empty" });
    }

    // Find the parent comment
    const parentComment = await Comment.findById(commentId);
    if (!parentComment || parentComment.isDeleted) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    // Create the reply
    const reply = new Comment({
      postId: parentComment.postId,
      userId,
      content: content.trim(),
      parentCommentId: commentId
    });

    const savedReply = await reply.save();

    // Add the reply to the parent comment's replies array
    await Comment.findByIdAndUpdate(commentId, {
      $push: { replies: savedReply._id }
    });

    // Populate the user data for the response
    const populatedReply = await Comment.findById(savedReply._id)
      .populate("userId", "email username profilePicture");

    res.status(201).json(populatedReply);
  } catch (error) {
    res.status(500).json({ message: "Failed to create reply", error: error.message });
  }
};
