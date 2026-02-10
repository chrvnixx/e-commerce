import User from "../../models/User.js";
import bcrypt from "bcrypt";
import generateTokens from "../../utils/generateTokens.js";
import {
  setCookie,
  storeRefreshToken,
} from "../../utils/storeRefreshTokenAndSetCookie.js";
import jwt from "jsonwebtoken";
import { redis } from "../../config/redis.js";

export async function signup(req, res) {
  const { email, password, name } = req.body;
  try {
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
      verificationToken: verificationToken,
      verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000,
    });

    await user.save();
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(refreshToken, user._id);
    setCookie(accessToken, refreshToken, res);

    res.status(201).json({
      success: true,
      message: "User created!!",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in signup controller", error);
  }
}

export async function verifyEmail(req, res) {
  const { code } = req.body;
  try {
    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Input verification code" });
    }

    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "verification complete", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in verify email controller", error);
  }
}

export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.json({ message: "No refresh token found" });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    await redis.del(`refresh_token:${decoded.userId}`);

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ success: false, message: "server error" });
    console.log("Error in logout controller");
  }
}
export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    user.lastLogin = Date.now();

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(refreshToken, user._id);
    setCookie(accessToken, refreshToken, res);

    res.status(200).json({ success: true, message: "Logged in", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in login controller", error);
  }
}

export async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;
  try {
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "Token not found" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res
        .status(500)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("accessToken", accessToken, {
      httponly: true,
      secure: (process.env.NODE_ENV = "production"),
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in refresh token controller", error);
  }
}
