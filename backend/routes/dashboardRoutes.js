import express from "express";

import catchAsync from "../utils/catchAsync.js";

import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();
import { getDashboardStats, getOrderStatusStats } from "../controllers/dashboardController.js";

router.get(
  "/dashboard-stats",
  protect,
  restrictTo("admin"),
  catchAsync(getDashboardStats),
);

router.get(
  "/dashboard-orderStatus-stats",
  protect,
  restrictTo("admin"),
  catchAsync(getOrderStatusStats),
);

export default router;
