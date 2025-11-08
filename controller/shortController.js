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
    const shorts = await Shorts.find()
      .sort({
        createdAt: -1,
      })
      .populate("channel")
      .populate({
        path: "comments.author",
        select: "userName photoUrl email",
      })
      .populate({
        path: "comments.replies.author",
        select: "userName photoUrl email",
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

export const toggleShortLikes = async (req, res) => {
  try {
    const { shortId } = req.body;

    const userId = req.user._id;

    const short = await Shorts.findById(shortId);

    if (!short) {
      return res.status(404).json({
        success: false,
        message: "Short not found",
      });
    }

    if (short.likes.includes(userId)) {
      short.likes = short.likes.filter(
        (like) => like._id.toString() !== userId.toString()
      );
    } else {
      short.likes.push(userId);
      short.dislikes = short.dislikes.filter(
        (dislike) => dislike._id.toString() !== userId.toString()
      );
    }

    await short.save();

    return res.status(200).json({
      success: true,
      message: "Short liked successfully",
      short,
    });
  } catch (error) {
    console.log("Error in toggle short likes", error);
    return res.status(500).json({
      success: false,
      message: `toggleShortLikes Error: ${error}`,
    });
  }
};

export const toggleShortDislikes = async (req, res) => {
  try {
    const { shortId } = req.body;

    const userId = req.user._id;

    const short = await Shorts.findById(shortId);

    if (!short) {
      return res.status(404).json({
        success: false,
        message: "Short not found",
      });
    }

    if (short.dislikes.includes(userId)) {
      short.dislikes = short.dislikes.filter(
        (dislike) => dislike._id.toString() !== userId.toString()
      );
    } else {
      short.dislikes.push(userId);
      short.likes = short.likes.filter(
        (like) => like._id.toString() !== userId.toString()
      );
    }

    await short.save();

    return res.status(200).json({
      success: true,
      message: "Short disliked successfully",
      short,
    });
  } catch (error) {
    console.log("Error in toggle short dislikes", error);
    return res.status(500).json({
      success: false,
      message: `toggleShortDislikes Error: ${error}`,
    });
  }
};

export const toggleShortSave = async (req, res) => {
  try {
    const { shortId } = req.body;

    const userId = req.user._id;

    const short = await Shorts.findById(shortId);

    if (!short) {
      return res.status(404).json({
        success: false,
        message: "Short not found",
      });
    }

    if (short.savedBy.includes(userId)) {
      short.savedBy = short.savedBy.filter(
        (save) => save._id.toString() !== userId.toString()
      );
    } else {
      short.savedBy.push(userId);
    }

    await short.save();

    return res.status(200).json({
      success: true,
      message: "Toggle Short Saved successfully",
      short,
    });
  } catch (error) {
    console.log("Error in toggle short save", error);
    return res.status(500).json({
      success: false,
      message: `toggleShortSave Error: ${error}`,
    });
  }
};

export const addShortViews = async (req, res) => {
  try {
    const { shortId } = req.body;

    const userId = req.user._id;

    const short = await Shorts.findById(shortId);

    if (!short) {
      return res.status(404).json({
        success: false,
        message: "Short not found",
      });
    }

    if (!short.views.includes(userId)) {
      short.views.push(userId);
    }

    await short.save();

    return res.status(200).json({
      success: true,
      message: "View Added successfully",
      short,
    });
  } catch (error) {
    console.log("Error in add short Views", error);
    return res.status(500).json({
      success: false,
      message: `addShortViews Error: ${error}`,
    });
  }
};

export const addShortComment = async (req, res) => {
  try {
    const { shortId, message } = req.body;
    const userId = req.user._id;

    const short = await Shorts.findById(shortId);

    if (!short) {
      return res.status(404).json({
        success: false,
        message: "Short not found",
      });
    }

    short.comments.unshift({
      author: userId,
      message,
    });

    await short.save();

    const populatedShort = await Shorts.findById(shortId)
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
      short: populatedShort,
    });
  } catch (error) {
    console.log("Error in add short Comments", error);
    return res.status(500).json({
      success: false,
      message: `addShortComment Error: ${error}`,
    });
  }
};

export const addShortReply = async (req, res) => {
  try {
    const { shortId, commentId, message } = req.body;

    const userId = req.user._id;

    const short = await Shorts.findById(shortId);

    if (!short) {
      return res.status(404).json({
        success: false,
        message: "Short not found",
      });
    }

    const comment = short.comments.id(commentId);

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

    await short.save();

    const populatedShort = await Shorts.findById(shortId)
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
      short: populatedShort,
    });
  } catch (error) {
    console.log("Error in add short Reply", error);
    return res.status(500).json({
      success: false,
      message: `addShortReply Error: ${error}`,
    });
  }
};
