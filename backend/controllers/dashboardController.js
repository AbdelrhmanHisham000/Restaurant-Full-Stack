import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import successResponse from "../utils/successResponse.js";

export async function getDashboardStats(req, res, next) {
  // Total Users
  const totalUsers = await User.countDocuments();

  // Total Orders
  const totalOrders = await Order.countDocuments();

  // Total Revenue
  const results = await Order.aggregate([
    {
      $match: {
        status: "pending",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$totalPrice",
        },
        averageOrder: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);

  const totalRevenue = results[0]?.totalRevenue || 0;
  // Average Order

  const averageOrder = results[0]?.averageOrder || 0;

  const data = {
    totalUsers,
    totalOrders,
    totalRevenue,
    averageOrder,
  };

  return successResponse(res, "Dashboard stats", data, 200);
}

export async function getOrderStatusStats(req, res, next) {
  const result = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return successResponse(res, "Dashboard Order Status stats", result, 200);
}
