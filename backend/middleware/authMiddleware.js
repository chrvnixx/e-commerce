import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protectRoute(req, res, next) {
  const accessToken = req.cookies.accessToken;
  try {
    if (!accessToken) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorised - No token provided" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorised - User not found" });
      }
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorised - Expired token" });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in protect route middleware");
  }
}

export function adminRoute(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(401)
      .json({ success: false, message: "Unauthorised - Admin only" });
  }
}
