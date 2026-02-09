import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/logout", logout);
router.post("/login", login);

export default router;
