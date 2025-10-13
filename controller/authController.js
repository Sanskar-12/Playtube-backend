import uploadOnCloudinary from "../config/cloudinary.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/token.js";
import { User } from "../model/userModel.js";
import { sendMail } from "../config/sendMail.js";

export const signUp = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    let photoUrl;

    if (req.file) {
      photoUrl = await uploadOnCloudinary(req.file.path);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
      photoUrl,
    });

    const token = generateToken(user);

    // remove password from user json
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log("Error in signUp Controller: ", error);
    return res.status(500).json({
      success: false,
      message: `SignUp Error: ${error}`,
    });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    // remove password from user json
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log("Error in signIn Controller: ", error);
    return res.status(500).json({
      success: false,
      message: `SignIn Error: ${error}`,
    });
  }
};

export const signOut = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Error in signOut Controller: ", error);
    return res.status(500).json({
      success: false,
      message: `SignIn Error: ${error}`,
    });
  }
};

export const authWithGoogle = async (req, res) => {
  try {
    const { userName, email, photoUrl } = req.body;

    let googlePhoto = photoUrl;

    if (photoUrl) {
      try {
        googlePhoto = await uploadOnCloudinary(photoUrl);
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: `Cannot upload image on cloudinary`,
        });
      }
    }

    const user = await User.findOne({ email });

    if (!user) {
      await User.create({
        userName,
        email,
        photoUrl: googlePhoto,
      });
    } else {
      if (!user.photoUrl && googlePhoto) {
        user.photoUrl = googlePhoto;
        await user.save();
      }
    }

    const token = generateToken(user);

    // remove password from user json
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log("Error in Auth With Google", error);
    return res.status(500).json({
      success: false,
      message: `AuthWithGoogle Error: ${error}`,
    });
  }
};

export const sendOtpMail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();

    await sendMail(email, otp);

    return res.status(200).json({
      success: true,
      message: "Otp sent Successfully",
    });
  } catch (error) {
    console.log("Error in send otp mail", error);
    return res.status(500).json({
      success: false,
      message: `SendOTPMail Error: ${error}`,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (otp !== user.resetOtp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.resetOtp = undefined;
    user.otpExpires = undefined;
    user.isOtpVerified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Otp verified Successfully",
    });
  } catch (error) {
    console.log("Error in verify otp", error);
    return res.status(500).json({
      success: false,
      message: `VerifyOTP Error: ${error}`,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isOtpVerified) {
      return res.status(400).json({
        success: false,
        message: "Otp is not verified",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user.password = hashPassword;
    user.isOtpVerified = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset Successful",
    });
  } catch (error) {
    console.log("Error in reset password", error);
    return res.status(500).json({
      success: false,
      message: `ResetPassword Error: ${error}`,
    });
  }
};
