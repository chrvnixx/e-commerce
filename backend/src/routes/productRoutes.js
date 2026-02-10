import express from "express";
import { getAllProducts } from "../controllers/productsControllers.js";
import { adminRoute, protectRoute } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getAllProducts);

export default router;
