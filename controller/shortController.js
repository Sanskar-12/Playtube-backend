import uploadOnCloudinary from "../config/cloudinary.js";
import { Channel } from "../model/channelModel.js";
import { Shorts } from "../model/shortModel.js";

export const createShorts = async (req, res) => {
  try {
    const { title, description, tags, channelId } = req.body;

    if (!title || !channelId) {
      return res.status(400).json({
        success: false,
        message: "Short title, channel id is required",
      });
    }

    let shortUrl;
    if (req.file) {
      shortUrl = await uploadOnCloudinary(req.file.path);
    }

    const channel = await Channel.findById(channelId);

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "Channel not found",
      });
    }

    let parsedTag = [];

    if (tags) {
      try {
        parsedTag = JSON.parse(tags);
      } catch (error) {
        parsedTag = [];
      }
    }

    const newShort = await Shorts.create({
      title,
      description,
      channel: channel._id,
      shortsUrl: shortUrl,
      tags: parsedTag,
    });

    await Channel.findByIdAndUpdate(
      channel._id,
      {
        $push: {
          shorts: newShort._id,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Shorts Created Successfully",
      newShort,
    });
  } catch (error) {
    console.log("Error in Create Shorts", error);
    return res.status(500).json({
      success: false,
      message: `createShorts Error: ${error}`,
    });
  }
};

export const getAllShorts = async (req, res) => {
  try {
    const shorts = await Shorts.find().sort({
      createdAt: -1,
    });

    if (!shorts) {
      return res.status(404).json({
        success: false,
        message: "Shorts not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shorts fetched successfully",
      shorts,
    });
  } catch (error) {
    console.log("Error in get All Shorts", error);
    return res.status(500).json({
      success: false,
      message: `getAllShorts Error: ${error}`,
    });
  }
};
