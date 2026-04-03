import Product from "../model/Product.js";

export async function addToCart(req, res) {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();

    res.json(user.cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in Add to cart controller");
  }
}

export async function removeAllFromCart(req, res) {
  const { productId } = req.body;
  const user = req.user;
  try {
    const product = user.cartItems.find((item) => item.id === productId);

    if (product) {
      user.cartItems.filter((item) => item.id !== productId);
    } else {
      user.cartItems;
    }

    await user.save();

    res.json(user.cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in remove all from cart");
  }
}

export async function updateQuantity(req, res) {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      if (existingItem.quantity === 0) {
        user.cartItem.filter((item) => item.id !== productId);
        await user.save();
        res.json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(400).json({ message: "product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in update quantyiy controller", error);
  }
}

export async function getCartProducts(req, res) {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id,
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.json(cartItems)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("Error in get cart products", error);
  }
}
