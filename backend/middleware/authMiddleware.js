import jwt from "jsonwebtoken";
import User from "../model/User.js";

export async function protectRoute(req, res, next) {
  const accessToken = req.cookies.accessToken;
  try {
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorised - token not provided" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(400)
          .json({ message: "Unauthorised - expired token" });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in delete product controller");
  }
}

export async function adminRoute(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(401).json({ message: "Unauthorised - admin only" });
  }
}
