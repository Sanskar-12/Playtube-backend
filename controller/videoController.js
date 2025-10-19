import uploadOnCloudinary from "../config/cloudinary.js";
import { Channel } from "../model/channelModel.js";
import { Video } from "../model/videoModel.js";

export const createVideo = async (req, res) => {
  try {
    const { title, description, tags, channelId } = req.body;

    if (!title || !req.files.video || !req.files.thumbnail || channelId) {
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
