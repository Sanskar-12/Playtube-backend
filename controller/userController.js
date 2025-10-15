import uploadOnCloudinary from "../config/cloudinary.js";
import { Channel } from "../model/channelModel.js";
import { User } from "../model/userModel.js";
import mongoose from "mongoose";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("channel");

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }

    return res.status(200).json({
      success: true,
      message: "Current User Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log("Error in Get Current User", error);
    return res.status(500).json({
      success: false,
      message: `getCurrentUser Error: ${error}`,
    });
  }
};

export const createChannel = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    const userId = req.user._id;

    const existingChannel = await Channel.findOne({
      owner: userId,
    });

    if (existingChannel) {
      return res.status(400).json({ message: "Channel already created" });
    }

    const existingChannelName = await Channel.findOne({
      name,
    });

    if (existingChannelName) {
      return res.status(400).json({ message: "Channel Name already taken" });
    }

    let avatar;
    let banner;

    if (req.files?.avatar) {
      avatar = await uploadOnCloudinary(req.files?.avatar[0].path);
    }
    if (req.files?.banner) {
      banner = await uploadOnCloudinary(req.files?.banner[0].path);
    }

    const channel = await Channel.create({
      owner: userId,
      name,
      description,
      category,
      avatar,
      banner,
    });

    await User.findByIdAndUpdate(userId, {
      channel: channel._id,
      userName: name,
      photoUrl: avatar,
    });

    return res.status(200).json({
      success: true,
      message: "Channel Created Successfully",
      channel,
    });
  } catch (error) {
    console.log("Error in create Channel", error);
    return res.status(500).json({
      success: false,
      message: `createChannel Error: ${error}`,
    });
  }
};

export const getChannelData = async (req, res) => {
  try {
    const userId = req.user._id;
    const objectId = new mongoose.Types.ObjectId(userId);

    const channel = await Channel.findOne({ owner: objectId }).populate(
      "owner"
    );

    if (!channel) {
      return res.status(404).json({ message: "Channel doesn't exists" });
    }

    return res.status(200).json({
      success: true,
      message: "Channel fetched successfully",
      channel,
    });
  } catch (error) {
    console.log("Error in get Channel Data", error);
    return res.status(500).json({
      success: false,
      message: `getChannelData Error: ${error}`,
    });
  }
};
