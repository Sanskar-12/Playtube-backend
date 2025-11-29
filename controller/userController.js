import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../config/cloudinary.js";
import { Channel } from "../model/channelModel.js";
import { User } from "../model/userModel.js";
import { Video } from "../model/videoModel.js";
import { Shorts } from "../model/shortModel.js";

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

export const updateChannel = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    const userId = req.user._id;

    let existingChannel = await Channel.findOne({
      owner: userId,
    });

    if (!existingChannel) {
      return res.status(400).json({ message: "Channel not found" });
    }

    if (name && name !== existingChannel.name) {
      const existingChannelName = await Channel.findOne({
        name,
      });

      if (existingChannelName) {
        return res.status(400).json({ message: "Channel Name already taken" });
      }

      existingChannel.name = name;
    }

    if (description !== undefined) {
      existingChannel.description = description;
    }

    if (category !== undefined) {
      existingChannel.category = category;
    }

    if (req.files?.avatar) {
      await deleteFromCloudinary(existingChannel?.avatar);
      const avatar = await uploadOnCloudinary(req.files.avatar[0].path);
      existingChannel.avatar = avatar;
    }
    if (req.files?.banner) {
      await deleteFromCloudinary(existingChannel?.banner);
      const banner = await uploadOnCloudinary(req.files.banner[0].path);
      existingChannel.banner = banner;
    }

    const updatedChannel = await existingChannel.save();

    await User.findByIdAndUpdate(
      userId,
      {
        userName: name || undefined,
        photoUrl: updatedChannel.avatar || undefined,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Channel Updated Successfully",
      updatedChannel,
    });
  } catch (error) {
    console.log("Error in update Channel", error);
    return res.status(500).json({
      success: false,
      message: `updateChannel Error: ${error}`,
    });
  }
};

export const getChannelData = async (req, res) => {
  try {
    const userId = req.user._id;

    const channel = await Channel.findOne({ owner: userId })
      .populate("owner")
      .populate("videos")
      .populate("shorts")
      .populate("subscribers")
      .populate({
        path: "communityPosts",
        populate: {
          path: "channel",
          model: "Channel",
        },
      })
      .populate({
        path: "playlists",
        populate: {
          path: "videos",
          model: "Video",
          populate: {
            path: "channel",
            model: "Channel",
          },
        },
      });

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

export const addOrRemoveSubscribers = async (req, res) => {
  try {
    const { channelId } = req.body;

    const userId = req.user._id;

    if (!channelId) {
      return res.status(400).json({ message: "Channel Id is required" });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel doesn't exists" });
    }

    const isSubscribed = channel?.subscribers?.includes(userId);

    if (isSubscribed) {
      channel.subscribers = channel?.subscribers?.filter(
        (sub) => sub._id.toString() !== userId.toString()
      );
    } else {
      channel?.subscribers?.push(userId);
    }

    await channel.save();

    const updatedChannel = await Channel.findById(channelId)
      .populate("owner")
      .populate("videos")
      .populate("shorts");

    return res.status(200).json({
      success: true,
      message: "Toggle Subscribe successful",
      updatedChannel,
    });
  } catch (error) {
    console.log("Error in add subscribers", error);
    return res.status(500).json({
      success: false,
      message: `addSubscribers Error: ${error}`,
    });
  }
};

export const getAllChannelData = async (req, res) => {
  try {
    const channels = await Channel.find()
      .populate("owner")
      .populate("videos")
      .populate("shorts")
      .populate("subscribers")
      .populate({
        path: "communityPosts",
        populate: [
          {
            path: "channel",
            model: "Channel",
          },
          {
            path: "comments.author",
            model: "User",
            select: "userName photoUrl",
          },
          {
            path: "comments.replies.author",
            model: "User",
            select: "userName photoUrl",
          },
        ],
      })
      .populate({
        path: "playlists",
        populate: {
          path: "videos",
          model: "Video",
          populate: {
            path: "channel",
            model: "Channel",
          },
        },
      });

    if (!channels) {
      return res.status(400).json({
        success: false,
        message: "Channel not found",
      });
    }

    return res.status(200).json({
      success: true,
      channels,
    });
  } catch (error) {
    console.log("Error in get All Channel Data", error);
    return res.status(500).json({
      success: false,
      message: `getAllChannelData Error: ${error}`,
    });
  }
};

export const getSubscribedData = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscribedChannels = await Channel.find({
      subscribers: { $in: [userId] },
    })
      .populate({
        path: "videos",
        populate: {
          path: "channel",
          select: "name avatar",
        },
      })
      .populate({
        path: "shorts",
        populate: {
          path: "channel",
          select: "name avatar",
        },
      })
      .populate({
        path: "playlists",
        populate: [
          {
            path: "channel",
            select: "name avatar",
          },
          {
            path: "videos",
            populate: {
              path: "channel",
              select: "name avatar",
            },
          },
        ],
      })
      .populate({
        path: "communityPosts",
        populate: [
          {
            path: "channel",
            select: "name avatar",
          },
          {
            path: "comments",
            populate: [
              { path: "author" },
              {
                path: "replies",
                populate: {
                  path: "author",
                },
              },
            ],
          },
        ],
      });

    if (!subscribedChannels || subscribedChannels.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Failed to find subscribed Channels",
      });
    }

    const videos = subscribedChannels.flatMap((c) => c.videos);
    const shorts = subscribedChannels.flatMap((c) => c.shorts);
    const playlists = subscribedChannels.flatMap((c) => c.playlists);
    const communityPosts = subscribedChannels.flatMap((c) => c.communityPosts);

    return res.status(200).json({
      success: true,
      subscribedChannels,
      videos,
      shorts,
      playlists,
      communityPosts,
    });
  } catch (error) {
    console.log("Error in get Subscribed Data", error);
    return res.status(500).json({
      success: false,
      message: `getSubscribedData Error: ${error}`,
    });
  }
};

export const addHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const { contentId, contentType } = req.body;

    if (!["Video", "Short"].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Content Type",
      });
    }

    let content;
    if (contentType === "Video") {
      content = await Video.findById(contentId);
    } else {
      content = await Shorts.findById(contentId);
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: `${contentType} not found`,
      });
    }

    // removing duplicate history
    await User.findByIdAndUpdate(userId, {
      $pull: {
        history: {
          contentId,
          contentType,
        },
      },
    });

    // adding new history
    await User.findByIdAndUpdate(userId, {
      $push: {
        history: {
          contentId,
          contentType,
          watchedAt: new Date(),
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "History Added",
    });
  } catch (error) {
    console.log("Error in add History", error);
    return res.status(500).json({
      success: false,
      message: `addHistory Error: ${error}`,
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate({
        path: "history.contentId",
        populate: {
          path: "channel",
          select: "name avatar",
        },
      })
      .select("history");

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const sortedHistory = [...user.history].sort(
      (a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)
    );

    return res.status(200).json({
      success: true,
      history: sortedHistory,
    });
  } catch (error) {
    console.log("Error in get History", error);
    return res.status(500).json({
      success: false,
      message: `getHistory Error: ${error}`,
    });
  }
};
