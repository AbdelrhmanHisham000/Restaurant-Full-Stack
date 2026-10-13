import express from "express";

import catchAsync from "../utils/catchAsync.js";

import {
  addToCart,
  addItemToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

import { protect } from "../controllers/authController.js";

const router = express.Router();

router.get("/", protect, catchAsync(getCart));

router.post("/", protect, catchAsync(addToCart));

router.post("/items", protect, catchAsync(addItemToCart));

router.patch("/:productId", protect, catchAsync(updateCartItem));

router.delete("/", protect, catchAsync(clearCart));

router.delete("/:productId", protect, catchAsync(removeFromCart));

export default router;
