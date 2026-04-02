import express from "express"
import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts } from "../controllers/productControllers.js"
import { adminRoute, protectRoute } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", protectRoute, adminRoute, getAllProducts)
router.get("/featured",  getFeaturedProducts)
router.post("/create-product", protectRoute, adminRoute, createProduct)
router.delete("/create-product/:id", protectRoute, adminRoute, deleteProduct)

export default router