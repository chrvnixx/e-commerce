import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getCoupon, validateCoupon } from "../controllers/couponControllers.js";

const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.get("/validate", protectRoute, validateCoupon);

export default router;
