import jwt from "jsonwebtoken";

export const isAuth = (req, res, next) => {
  try {
    let { token } = req.cookies;

    if (!token) {
      return res.status(400).json({ message: "user does't have token" });
    }

    const isVerifiedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!isVerifiedToken) {
      return res.status(400).json({ message: "Token is invalid" });
    }

    req.userId = token.userId;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `isAuth error ${error}` });
  }
};
