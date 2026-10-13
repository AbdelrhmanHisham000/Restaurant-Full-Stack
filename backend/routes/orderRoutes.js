import express from "express";

import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatus,
  getCheckoutSession,
} from "../controllers/orderController.js";

import catchAsync from "../utils/catchAsync.js";

import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.post("/create", protect, catchAsync(createOrder));

router.get("/checkout-session/:cartId", protect, catchAsync(getCheckoutSession));

router.get("/myOrders", protect, catchAsync(getOrdersByUserId));

router.get("/", protect, restrictTo("admin"), catchAsync(getAllOrders));

router.get("/:orderId", protect, catchAsync(getOrderById));

router.patch("/:orderId/cancel", protect, catchAsync(cancelOrder));

router.patch(
  "/:orderId/status",
  protect,
  restrictTo("admin"),
  catchAsync(updateOrderStatus),
);

export default router;
