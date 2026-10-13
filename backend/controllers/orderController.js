import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";

import Product from "../models/productModel.js";
import stripe from "../utils/stripe.js";

import successResponse from "../utils/successResponse.js";

export async function getCheckoutSession(req, res, next) {
  // 1. Get cart
  const { cartId } = req.params;
  const cart = await Cart.findById(cartId);

  if (!cart) {
    return res.status(404).json({
      status: "Fail",
      message: "Cart not found",
    });
  }

  if (cart.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: "Fail",
      message: "This cart does not belong to you",
    });
  }
  // 2. Get products from DB
  const productIds = cart.items.map((item) => item.product);

  const products = await Product.find({
    _id: { $in: productIds },
  });

  const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

  // 3. Validate products + build order items
  const orderItems = [];

  for (const cartItem of cart.items) {
    const product = productsMap.get(cartItem.product.toString());

    if (!product) {
      return res.status(404).json({
        status: "Fail",
        message: "Product not found",
      });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        status: "Fail",
        message: `${product.name} is not available`,
      });
    }

    orderItems.push({
      product: product._id,
      quantity: cartItem.quantity,
      price: product.price,
    });
  }

  // 5. Calculate total
  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalPrice: total,
    deliveryAddress: req.body?.deliveryAddress || "Default Delivery Address",
    status: "pending",
  });

  // 7. Create Stripe session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    line_items: orderItems.map((item) => {
      const product = productsMap.get(item.product.toString());

      return {
        price_data: {
          currency: "egp",

          product_data: {
            name: product.name,
          },

          unit_amount: Math.round(item.price * 100),
        },

        quantity: item.quantity,
      };
    }),

    success_url: `http://localhost:3000/payment/success?orderId=${order._id}`,
    cancel_url: "http://localhost:3000/payment/cancel",

    metadata: {
      orderId: order._id.toString(),
    },
  });

  // 8. Return checkout URL
  return res.status(200).json({
    status: "Success",
    checkoutUrl: session.url,
  });
}

export async function createOrder(req, res, next) {
  const { items } = req.body;

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      return res.status(404).json({
        status: "Fail",
        message: "Product not found",
      });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        status: "Fail",
        message: `${product.name} is not available`,
      });
    }
  }

  const newOrder = await Order.create({
    ...req.body,
    user: req.user._id,
  });

  successResponse(res, "Order Created Successfully", newOrder);
}

export async function getOrdersByUserId(req, res, next) {
  const userID = req.user._id;

  const orders = await Order.find({ user: userID }).populate("items.product");

  successResponse(res, `${req.user.name} Orders`, orders);
}

export async function getOrderById(req, res, next) {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate("items.product");

  if (!order) {
    return res.status(404).json({
      status: "Fail",
      message: "Order not found",
    });
  }

  successResponse(res, "Order", order);
}

export async function getAllOrders(req, res, next) {
  const orders = await Order.find().populate("user").populate("items.product");

  successResponse(res, "All Orders", orders);
}

export async function updateOrderStatus(req, res, next) {
  const { orderId } = req.params;

  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!order) {
    return res.status(404).json({
      status: "Fail",
      message: "Order not found",
    });
  }

  successResponse(res, "Order Status Updated Successfully", order);
}

export async function cancelOrder(req, res, next) {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      status: "Fail",
      message: "Order not found",
    });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: "Fail",
      message: "You are not allowed to cancel this order",
    });
  }

  if (order.status !== "pending") {
    return res.status(400).json({
      status: "Fail",
      message: "Order cannot be cancelled",
    });
  }

  order.status = "cancelled";

  await order.save();

  successResponse(res, "Order Cancelled Successfully", order);
}
