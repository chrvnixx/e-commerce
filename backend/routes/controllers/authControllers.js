import User from "../../models/User.js";


export async function signup(req, res) {
  const { email, name, password } = req.body;
  try {
    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      name,
      password,
    });

    await user.save();

    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in signup controller");
  }
}
export async function login(req, res) {}
export async function logout(req, res) {}
