import { Channel } from "../model/channelModel.js";
import { Playlist } from "../model/playlistModel.js";
import { Video } from "../model/videoModel.js";

export const createPlaylist = async (req, res) => {
  try {
    const { title, description, channelId, videoIds } = req.body;

    if (!title || !channelId) {
      return res.status(400).json({
        success: false,
        message: "To create playlist, title and channelId is required",
      });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(400).json({
        success: false,
        message: "Channel not found",
      });
    }

    const videos = await Video.find({
      _id: {
        $in: videoIds,
      },
      channel: channelId,
    });

    if (videos.length !== videoIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some videos are missing",
      });
    }

    const playlist = await Playlist.create({
      title,
      description,
      channel: channelId,
      videos: videoIds,
    });

    await Channel.findByIdAndUpdate(
      channelId,
      {
        $push: {
          playlists: playlist._id,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Playlist created",
      playlist,
    });
  } catch (error) {
    console.log("Error in create Playlist ", error);
    return res.status(500).json({
      success: false,
      message: `createPlaylist ${error}`,
    });
  }
};

export const toggleSavePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.body;

    const userId = req.user._id;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (playlist.savedBy.includes(userId)) {
      playlist.savedBy = playlist.savedBy.filter(
        (save) => save._id.toString() !== userId.toString()
      );
    } else {
      playlist.savedBy.push(userId);
    }

    await playlist.save();

    return res.status(200).json({
      success: true,
      message: "Toggle Playlist Saved successfully",
      playlist,
    });
  } catch (error) {
    console.log("Error in toggle save", error);
    return res.status(500).json({
      success: false,
      message: `toggleSave Error: ${error}`,
    });
  }
};
