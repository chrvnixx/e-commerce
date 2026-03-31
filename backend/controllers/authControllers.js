import User from "../models/User.js";
import generateTokens from "../utils/generateToken.js";
import setCookies from "../utils/setCookies.js";
import storeRefreshToken from "../utils/storeRefreshToken.js";

export async function signup(req, res) {
  const { email, name, password } = req.body;
  try {
    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      email,
      name,
      password,
    });

    const { accessToken, refreshToken } = generateTokens(res, user._id);
    storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: { ...user._doc, password: undefined },
      message: "User created",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in signup controller", error);
  }
}
export async function login(req, res) {}
export async function logout(req, res) {}
