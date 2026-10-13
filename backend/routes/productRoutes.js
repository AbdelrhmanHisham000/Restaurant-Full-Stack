import express from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductPhoto,
  resizeProductPhoto,
} from "../controllers/productController.js";

import catchAsync from "../utils/catchAsync.js";

import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  restrictTo("admin"),
  uploadProductPhoto,
  resizeProductPhoto,
  createProduct,
);

router.get("/", protect, restrictTo("admin"), catchAsync(getAllProducts));

router.get("/:id", protect, restrictTo("admin"), getProductById);

router.patch(
  "/update/:id",
  protect,
  restrictTo("admin", "user"),
  uploadProductPhoto,
  resizeProductPhoto,
  updateProduct,
);

router.delete("/delete/:id", protect, restrictTo("admin"), deleteProduct);

export default router;
