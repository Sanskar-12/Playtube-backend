import uploadOnCloudinary from "../config/cloudinary.js";
import { Channel } from "../model/channelModel.js";
import { Post } from "../model/postModel.js";

export const createPost = async (req, res) => {
  try {
    const { channelId, content } = req.body;

    const file = req.file;

    if (!channelId || !content) {
      return res.status(400).json({
        success: false,
        message: "Channel Id and Content is required",
      });
    }

    let imageUrl;

    if (file) {
      imageUrl = await uploadOnCloudinary(req.file.path);
    }

    const post = await Post.create({
      channel: channelId,
      content,
      image: imageUrl,
    });

    await Channel.findByIdAndUpdate(
      channelId,
      {
        $push: {
          communityPosts: post._id,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Post created",
      post,
    });
  } catch (error) {
    console.log("Error in create Post", error);
    return res.status(500).json({
      success: false,
      message: `createPost ${error}`,
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({
        createdAt: -1,
      })
      .populate("channel comments.author comments.replies.author");

    if (!posts) {
      return res.status(404).json({
        success: false,
        message: "Posts not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.log("Error in get All Posts", error);
    return res.status(500).json({
      success: false,
      message: `getAllPosts Error: ${error}`,
    });
  }
};

export const togglePostLikes = async (req, res) => {
  try {
    const { postId } = req.body;

    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(
        (like) => like._id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post liked successfully",
      post,
    });
  } catch (error) {
    console.log("Error in toggle post likes", error);
    return res.status(500).json({
      success: false,
      message: `togglePostLikes Error: ${error}`,
    });
  }
};

export const addPostComment = async (req, res) => {
  try {
    const { postId, message } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.comments.unshift({
      author: userId,
      message,
    });

    await post.save();

    const populatedPost = await Post.findById(postId)
      .populate({
        path: "comments.author",
        select: "userName photoUrl email",
      })
      .populate({
        path: "comments.replies.author",
        select: "userName photoUrl email",
      });

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.log("Error in add Post Comments", error);
    return res.status(500).json({
      success: false,
      message: `addPostComment Error: ${error}`,
    });
  }
};

export const addPostReply = async (req, res) => {
  try {
    const { postId, commentId, message } = req.body;

    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    comment.replies.unshift({
      author: userId,
      message,
    });

    await post.save();

    const populatedPost = await Post.findById(postId)
      .populate({
        path: "comments.author",
        select: "userName photoUrl email",
      })
      .populate({
        path: "comments.replies.author",
        select: "userName photoUrl email",
      });

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.log("Error in add post Reply", error);
    return res.status(500).json({
      success: false,
      message: `addPostReply Error: ${error}`,
    });
  }
};
