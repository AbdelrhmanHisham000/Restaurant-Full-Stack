import express from "express";

import catchAsync from "../utils/catchAsync.js";

import {
  createReview,
  getAllReviews,
  getReviewsByProductId,
  getReviewsByUserId,
} from "../controllers/reviewController.js";

import { protect } from "../controllers/authController.js";

const router = express.Router();

// Get all reviews
router.get("/", catchAsync(getAllReviews));

// Get reviews by logged-in user
router.get("/me", protect, catchAsync(getReviewsByUserId));

// Get review by ProductID
router.get("/:productId", protect, catchAsync(getReviewsByProductId));

// Create review
router.post("/createReview", protect, catchAsync(createReview));

// // Update review
// router.patch("/:id", protect, catchAsync(updateReview));

// // Delete review
// router.delete("/:id", protect, catchAsync(deleteReview));

export default router;
