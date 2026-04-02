import cloudinary from "../config/cloudinary.js";
import { redis } from "../config/redis.js";
import Product from "../model/Product.js";

export async function getAllProducts(req, res) {
  try {
    const products = await Product.find({});

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in get all products controller");
  }
}

export async function getFeaturedProducts(req, res) {
  try {
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      res.status(404).json({ message: "No featured products found" });
    }

    await redis.set("featured_Products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in get featured products controller");
  }
}

export async function createProduct(req, res) {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "Products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in create product controller");
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from cloudinary");
      } catch (error) {
        console.log("Error deleting image from cloudinary");
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in delete product controller");
  }
}
