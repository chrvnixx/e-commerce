import Product from "../../models/productModels.js";

export async function getAllProducts(req, res) {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in get all products controller", error);
  }
}
