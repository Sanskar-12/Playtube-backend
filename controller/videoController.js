import uploadOnCloudinary from "../config/cloudinary.js";
import { Channel } from "../model/channelModel.js";
import { Video } from "../model/videoModel.js";

export const createVideo = async (req, res) => {
  try {
    const { title, description, tags, channelId } = req.body;

    if (!title || !req.files.video || !req.files.thumbnail || !channelId) {
      return res.status(400).json({
        success: false,
        message: "title, videoUrl, thumbnail, channelId is required",
      });
    }

    const channelData = await Channel.findById(channelId);
    if (!channelData) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    const uploadVideo = await uploadOnCloudinary(req.files.video[0].path);
    const uploadThumbnail = await uploadOnCloudinary(
      req.files.thumbnail[0].path
    );

    let parsedTag = [];

    if (tags) {
      try {
        parsedTag = JSON.parse(tags);
      } catch (error) {
        parsedTag = [];
      }
    }

    const newVideo = await Video.create({
      title,
      channel: channelData._id,
      description,
      tags: parsedTag,
      videoUrl: uploadVideo,
      thumbnail: uploadThumbnail,
    });

    await Channel.findByIdAndUpdate(
      channelData._id,
      {
        $push: {
          videos: newVideo._id,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Video Created Successfully",
      newVideo,
    });
  } catch (error) {
    console.log("Error in Create Video", error);
    return res.status(500).json({
      success: false,
      message: `createVideo Error: ${error}`,
    });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({
        createdAt: -1,
      })
      .populate("channel");

    if (!videos) {
      return res.status(404).json({
        success: false,
        message: "Videos not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Videos fetched successfully",
      videos,
    });
  } catch (error) {
    console.log("Error in get All Videos", error);
    return res.status(500).json({
      success: false,
      message: `getAllVideos Error: ${error}`,
    });
  }
};

export const toggleLikes = async (req, res) => {
  try {
    const { videoId } = req.body;

    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (video.likes.includes(userId)) {
      video.likes = video.likes.filter(
        (like) => like._id.toString() !== userId.toString()
      );
    } else {
      video.likes.push(userId);
      video.dislikes = video.dislikes.filter(
        (dislike) => dislike._id.toString() !== userId.toString()
      );
    }

    await video.save();

    return res.status(200).json({
      success: true,
      message: "Video liked successfully",
      video,
    });
  } catch (error) {
    console.log("Error in toggle likes", error);
    return res.status(500).json({
      success: false,
      message: `toggleLikes Error: ${error}`,
    });
  }
};

export const toggleDislikes = async (req, res) => {
  try {
    const { videoId } = req.body;

    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (video.dislikes.includes(userId)) {
      video.dislikes = video.dislikes.filter(
        (dislike) => dislike._id.toString() !== userId.toString()
      );
    } else {
      video.dislikes.push(userId);
      video.likes = video.likes.filter(
        (like) => like._id.toString() !== userId.toString()
      );
    }

    await video.save();

    return res.status(200).json({
      success: true,
      message: "Video disliked successfully",
      video,
    });
  } catch (error) {
    console.log("Error in toggle dislikes", error);
    return res.status(500).json({
      success: false,
      message: `toggleDislikes Error: ${error}`,
    });
  }
};

export const toggleSave = async (req, res) => {
  try {
    const { videoId } = req.body;

    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (video.savedBy.includes(userId)) {
      video.savedBy = video.savedBy.filter(
        (save) => save._id.toString() !== userId.toString()
      );
    } else {
      video.savedBy.push(userId);
    }

    await video.save();

    return res.status(200).json({
      success: true,
      message: "Toggle Video Saved successfully",
      video,
    });
  } catch (error) {
    console.log("Error in toggle save", error);
    return res.status(500).json({
      success: false,
      message: `toggleSave Error: ${error}`,
    });
  }
};

export const addViews = async (req, res) => {
  try {
    const { videoId } = req.body;

    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (!video.views.includes(userId)) {
      video.views.push(userId);
    }

    await video.save();

    return res.status(200).json({
      success: true,
      message: "View Added successfully",
      video,
    });
  } catch (error) {
    console.log("Error in add Views", error);
    return res.status(500).json({
      success: false,
      message: `addViews Error: ${error}`,
    });
  }
};
