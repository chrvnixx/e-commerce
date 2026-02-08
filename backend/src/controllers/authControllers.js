import User from "../../models/User.js";
import bcrypt from "bcrypt";

export async function signup(req, res) {
  const { email, name, password } = req.body;
  try {
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
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
      verificationTokenExpiresAt: Date.now() + 0.3 * 60 * 60 * 1000,
    });

    generateTokenAndSetCookie(user._id, res);
  } catch (error) {}
}
