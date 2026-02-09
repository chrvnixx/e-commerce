import User from "../../models/User.js";
import bcrypt from "bcrypt";
import generateTokens from "../../utils/generateTokens.js";
import {
  setCookie,
  storeRefreshToken,
} from "../../utils/storeRefreshTokenAndSetCookie.js";

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
