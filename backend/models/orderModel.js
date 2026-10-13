import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order user is required"],
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Order product is required"],
        },

        quantity: {
          type: Number,
          required: [true, "Product quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },

        price: {
          type: Number,
          required: [true, "Product price is required"],
          min: [0, "Price cannot be negative"],
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: [true, "Order total price is required"],
      min: [0, "Total price cannot be negative"],
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },

    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
