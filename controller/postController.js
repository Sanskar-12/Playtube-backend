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
