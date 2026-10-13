import mongoose from "mongoose";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import successResponse from "../utils/successResponse.js";
// ===============================
// Add Product To Cart (Create)
// ===============================
export const addToCart = async (req, res) => {
  try {
    const { items } = req.body;

    // 1. Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "Fail",
        message: "Cart items are required",
      });
    }

    // 2. Validate each item
    for (const item of items) {
      if (!item.product) {
        return res.status(400).json({
          status: "Fail",
          message: "Product is required",
        });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          status: "Fail",
          message: "Quantity must be at least 1",
        });
      }

      // 3. Check product exists
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          status: "Fail",
          message: `Product ${item.product} not found`,
        });
      }

      // 4. Check product availability
      if (!product.isAvailable) {
        return res.status(400).json({
          status: "Fail",
          message: `${product.name} is not available`,
        });
      }
    }

    // 5. Check if user already has a cart
    const existingCart = await Cart.findOne({
      user: req.user._id,
    });

    if (existingCart) {
      return res.status(400).json({
        status: "Fail",
        message: "User already has a cart",
      });
    }

    // 6. Create cart
    const cart = await Cart.create({
      user: req.user._id,
      items,
    });

    return successResponse(res, "Cart created successfully", cart, 201);
  } catch (err) {
    return res.status(500).json({
      status: "Fail",
      message: err.message,
    });
  }
};

export const addItemToCart = async (req, res) => {
  try {
    const { product, quantity = 1 } = req.body;

    if (!product) {
      return res.status(400).json({
        status: "Fail",
        message: "Product is required",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        status: "Fail",
        message: "Quantity must be at least 1",
      });
    }

    const productDoc = await Product.findById(product);

    if (!productDoc) {
      return res.status(404).json({
        status: "Fail",
        message: "Product not found",
      });
    }

    if (!productDoc.isAvailable) {
      return res.status(400).json({
        status: "Fail",
        message: `${productDoc.name} is not available`,
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    /*
      لو مفيش Cart
      ننشئ واحد
    */

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [
          {
            product,
            quantity,
          },
        ],
      });
    } else {
      /*
        هل المنتج موجود؟
      */

      const existingItem = cart.items.find(
        (item) => item.product.toString() === product,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          product,
          quantity,
        });
      }

      await cart.save();
    }

    await cart.populate("items.product");

    return successResponse(res, "Product added to cart successfully", cart);
  } catch (err) {
    return res.status(500).json({
      status: "Fail",
      message: err.message,
    });
  }
};

// ===============================
// Get Cart
// ===============================

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart) {
      return successResponse(res, "Cart is empty", {
        items: [],
      });
    }

    return successResponse(res, "Cart fetched successfully", cart);
  } catch (err) {
    return res.status(500).json({
      status: "Fail",
      message: err.message,
    });
  }
};

// ===============================
// Update Cart Item Quantity
// ===============================

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "Fail",
        message: "Invalid product ID",
      });
    }

    // 2. Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        status: "Fail",
        message: "Quantity must be at least 1",
      });
    }

    // 3. Find user's cart
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        status: "Fail",
        message: "Cart not found",
      });
    }

    // 4. Find product inside cart
    const item = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!item) {
      return res.status(404).json({
        status: "Fail",
        message: "Product not found in cart",
      });
    }

    // 5. Update quantity
    item.quantity = quantity;

    await cart.save();

    // 6. Return updated cart with products
    await cart.populate("items.product");

    return successResponse(res, "Cart item updated successfully", cart);
  } catch (err) {
    return res.status(500).json({
      status: "Fail",
      message: err.message,
    });
  }
};

// ===============================
// Remove Product From Cart
// ===============================

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "Fail",
        message: "Invalid product ID",
      });
    }

    // 2. Find user's cart
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        status: "Fail",
        message: "Cart not found",
      });
    }

    // 3. Check if product exists in cart
    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId,
    );

    if (!itemExists) {
      return res.status(404).json({
        status: "Fail",
        message: "Product not found in cart",
      });
    }

    // 4. Remove product
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await cart.save();

    // 5. Return updated cart with products
    await cart.populate("items.product");

    return successResponse(res, "Product removed from cart successfully", cart);
  } catch (err) {
    return res.status(500).json({
      status: "Fail",
      message: err.message,
    });
  }
};

// ===============================
// Clear Cart
// ===============================

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return successResponse(res, "Cart cleared successfully", { items: [] });
    }

    // Remove all items
    cart.items = [];

    await cart.save();

    return successResponse(res, "Cart cleared successfully", cart);
  } catch (err) {
    return res.status(500).json({
      status: "Fail",
      message: err.message,
    });
  }
};
