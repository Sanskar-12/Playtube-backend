import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../config/cloudinary.js";
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
      .populate("channel comments.author comments.replies.author");

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

export const addComment = async (req, res) => {
  try {
    const { videoId, message } = req.body;
    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.comments.unshift({
      author: userId,
      message,
    });

    await video.save();

    const populatedVideo = await Video.findById(videoId)
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
      video: populatedVideo,
    });
  } catch (error) {
    console.log("Error in add Comments", error);
    return res.status(500).json({
      success: false,
      message: `addComment Error: ${error}`,
    });
  }
};

export const addReply = async (req, res) => {
  try {
    const { videoId, commentId, message } = req.body;

    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const comment = video.comments.id(commentId);

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

    await video.save();

    const populatedVideo = await Video.findById(videoId)
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
      video: populatedVideo,
    });
  } catch (error) {
    console.log("Error in add Reply", error);
    return res.status(500).json({
      success: false,
      message: `addReply Error: ${error}`,
    });
  }
};

export const getLikedVideos = async (req, res) => {
  try {
    const userId = req.user._id;

    const likedVideos = await Video.find({
      likes: { $in: [userId] },
    })
      .populate("channel", "name avatar")
      .populate("likes", "userName");

    return res.status(200).json({
      success: true,
      message: "Fetched liked Videos successfully",
      video: likedVideos,
    });
  } catch (error) {
    console.log("Error in get Liked Videos", error);
    return res.status(500).json({
      success: false,
      message: `getLikesVideos Error: ${error}`,
    });
  }
};

export const getSavedVideos = async (req, res) => {
  try {
    const userId = req.user._id;

    const savedVideos = await Video.find({
      savedBy: { $in: [userId] },
    })
      .populate("channel", "name avatar")
      .populate("savedBy", "userName");

    return res.status(200).json({
      success: true,
      message: "Fetched Saved Videos successfully",
      video: savedVideos,
    });
  } catch (error) {
    console.log("Error in get Saved Videos", error);
    return res.status(500).json({
      success: false,
      message: `getSavedVideos Error: ${error}`,
    });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
      .populate("channel", "name avatar")
      .populate("likes", "username photoUrl");

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    return res.status(200).json({
      success: true,
      video,
    });
  } catch (error) {
    console.log("Error in get Video By Id", error);
    return res.status(500).json({
      success: false,
      message: `getVideoById Error: ${error}`,
    });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, tags } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    if (title) video.title = title;
    if (description) video.description = description;

    if (tags) {
      try {
        video.tags = JSON.parse(tags);
      } catch {
        video.tags = [];
      }
    }

    if (req.file) {
      await deleteFromCloudinary(video.thumbnail);
      const updatedThumbnail = await uploadOnCloudinary(req.file.path);
      video.thumbnail = updatedThumbnail;
    }

    await video.save();

    return res.status(200).json({
      success: true,
      video,
      message: "Video Updated successfully",
    });
  } catch (error) {
    console.log("Error in Update Video", error);
    return res.status(500).json({
      success: false,
      message: `updateVideo Error: ${error}`,
    });
  }
};
