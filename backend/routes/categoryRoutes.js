import express from "express";
import catchAsync from "../utils/catchAsync.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  restrictTo("admin"),
  catchAsync(createCategory),
);

router.post(
  "/delete/:id",
  protect,
  restrictTo("admin"),
  catchAsync(deleteCategory),
);

router.patch(
  "/update/:id",
  protect,
  restrictTo("admin"),
  catchAsync(updateCategory),
);

router.get("/", protect, restrictTo("admin"), getAllCategories);

// Get category by id
router.get("/:id", protect, restrictTo("admin"), getCategoryById);

export default router;
