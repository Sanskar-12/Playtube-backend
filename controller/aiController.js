import { GoogleGenAI } from "@google/genai";
import { Channel } from "../model/channelModel.js";
import { Video } from "../model/videoModel.js";
import { Shorts } from "../model/shortModel.js";
import { Playlist } from "../model/playlistModel.js";

export const searchWithAi = async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `You are a search assistant for a video streaming platform. 
The user query is: "${input}"

🎯 Your job:
- If query has typos, correct them.
- If query has multiple words, break them into meaningful keywords.
- Return only the corrected word(s), comma-separated.
- Do not explain, only return keyword(s).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let keyword = (response.text || input).trim().replace(/[\n\r]+/g, "");

    const searchWords = keyword
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);

    const buildRegexQuery = (fields) => {
      return {
        $or: searchWords.map((word) => ({
          $or: fields.map((field) => ({
            [field]: { $regex: word, $options: "i" },
          })),
        })),
      };
    };

    const matchedChannels = await Channel.find(
      buildRegexQuery(["name"])
    ).select("_id name avatar");

    const channelIds = matchedChannels.map((c) => c._id);

    const videos = await Video.find({
      $or: [
        buildRegexQuery(["title", "description", "tags"]),
        { channel: { $in: channelIds } },
      ],
    }).populate("channel comments.author comments.replies.author");

    const shorts = await Shorts.find({
      $or: [
        buildRegexQuery(["title", "tags"]),
        { channel: { $in: channelIds } },
      ],
    })
      .populate("channel", "name avatar")
      .populate("likes", "username photoUrl");

    const playlists = await Playlist.find({
      $or: [
        buildRegexQuery(["title", "description"]),
        { channel: { $in: channelIds } },
      ],
    })
      .populate("channel", "name avatar")
      .populate({
        path: "videos",
        populate: { path: "channel", select: "name avatar" },
      });

    return res.status(200).json({
      success: true,
      keyword,
      channels: matchedChannels,
      videos,
      shorts,
      playlists,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res
      .status(500)
      .json({ message: `Failed to search: ${error.message}` });
  }
};
