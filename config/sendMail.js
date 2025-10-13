import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"PlayTube" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset your Password",
      html: `<p>
      Your OTP for Password Reset is <b>${otp}</b>.
      It expires in 5 minutes
      </p>`,
    });

    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
