import cloudinary from "../config/cloudinary.js";
import { redis } from "../config/redis.js";
import Product from "../model/Product.js";

export async function getAllProducts(req, res) {
  try {
    const products = await Product.find({});

    res.status(201).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in delete product controller");
  }
}

export async function getFeaturedProducts(req, res) {
  try {
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    featuredProducts = await Product.find({ isFeatured: true });

    if (!featuredProducts) {
      return res.status(404).json({ message: "no featured products" });
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in delete product controller");
  }
}

export async function getProductsByCategory(req, res) {
  const { category } = req.params.category;

  try {
    const products = await Product.findOne({ category });

    if (!products) {
      return res.status(404).json({ message: "no products found" });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in delete product controller");
  }
}

export async function getRecommendedProducts(req, res) {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
          category: 1,
        },
      },
    ]);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in delete product controller");
  }
}

export async function createProduct(req, res) {
  const { name, price, image, description, category } = req.body;

  try {
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      console.log("Image uploaded to cloudinary");
    } else {
      return res
        .status(400)
        .json({ message: "Error uploading image to cloudinary" });
    }
    const product = await Product.create({
      name,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      description,
      category,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in create product controller");
  }
}

export async function toggleFeaturedProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProducts = await product.save();
      await updateFeaturedProductCache();
      res
        .status(200)
        .json({ message: "featured products cache updated", updatedProducts });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in toggle featured product controller");
  }
}

async function updateFeaturedProductCache() {
  try {
    const featuredProducts = await Product.findOne({ isFeatured: true });
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in update featured product cache  function");
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
      console.log("Image deleted from cloudinary");
    } else {
      return res
        .status(400)
        .json({ message: "Error deleting image from cloudinary" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in delete product controller");
  }
}
