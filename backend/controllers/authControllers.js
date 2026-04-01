import { redis } from "../config/redis.js";
import User from "../model/User.js";
import generateTokens from "../utils/generateTokens.js";
import setCookies from "../utils/setCookies.js";
import storeRefreshToken from "../utils/storeRefreshToken.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { email, name, password } = req.body;
  try {
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ email, name, password });

    const { accessToken, refreshToken } = generateTokens(user._id);

    storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "Account created",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in signup controller");
  }
}
export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && user.comparePassword) {
      const { accessToken, refreshToken } = generateTokens(user._id);

      storeRefreshToken(user._id, refreshToken);

      setCookies(res, accessToken, refreshToken);

      res.status(201).json({
        message: "user logged in",
        user: { ...user._doc, password: undefined },
      });
    } else {
      return res.status(400).json({ message: "invalid email / password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in login controller");
  }
}
export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in logout controller");
  }
}
export async function refreshToken(req,res) {
  const refreshToken = req.cookies.refreshToken;
  try {
    if (!refreshToken) {
      return res.status(401).json({ message: "no token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(400).json({ message: "invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: "true",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      message: "token refreshed",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in refresh token controller");
  }
}
