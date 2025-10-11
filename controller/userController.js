import { User } from "../model/userModel.js";

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
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `getCurrentUser Error: ${error}`,
    });
  }
};
