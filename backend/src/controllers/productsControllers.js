import cloudinary from "../../config/cloudinary.js";
import { redis } from "../../config/redis.js";
import Product from "../../models/Product.js";

export async function getAllProducts(req, res) {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in get all products controller", error);
  }
}

export async function getFeaturedProducts(req, res) {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }

    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res
        .status(400)
        .json({ success: false, message: "No featured products" });
    }

    await redis.set("featured_Products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in get featured products controller");
  }
}

export async function createProduct(req, res) {
  const { name, description, image, price, category } = req.body;
  try {
    let cloudinaryResponse = null;

    cloudinaryResponse = await cloudinary.uploader.upload(image, {
      folder: "products",
    });

    const product = await Product.create({
      name,
      description,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse?.secure_url
        : "",
      price,
      category,
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in create products controller");
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      try {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from cloudinary");
      } catch (error) {
        console.log("Error deleting imsge from cloudinary", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("product deleted");
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in get featured products controller");
  }
}

export async function getRecommendedProducts(req, res) {
  try {
    const product = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $product: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
        },
      },
    ]);
    res.json(product);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    console.log("Error in get recommended products controller");
  }
}

export async function getProductsByCategory(req, res) {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    if (!products) {
      return res.status(404).json({ message: "No products in this category" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.log("Error in get get products by category controller");
  }
}

export async function toggleFeaturedProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      const featuredProduct = await Product.find({ isFeatured: true }).lean();
      await redis.set("featured_product", JSON.stringify(featuredProduct));

      res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "server error" });
    console.log("Error in toggle featured products controller", error);
  }
}
