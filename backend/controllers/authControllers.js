import { redis } from "../config/redis.js";
import User from "../models/User.js";
import generateTokens from "../utils/generateTokens.js";
import setCookies from "../utils/setCookies.js";
import storeRefreshToken from "../utils/storeRefreshToken.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { email, password, name } = req.body;
  try {
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ email, password, name });

    const { accessToken, refreshToken } = generateTokens(user._id);

    storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "Account created",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in signup controller");
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

    res.status(200).json({ message: "logged out!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in logout controller");
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);

      storeRefreshToken(user._id, refreshToken);

      setCookies(res, accessToken, refreshToken);

      res.status(200).json({ user: { ...user._doc, password: undefined } });
    } else {
      res.status(400).json({ message: "Invalid email / password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in login controller");
  }
}

export async function refreshToken(req, res) {
  
}
