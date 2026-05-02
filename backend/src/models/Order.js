import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: String,
    price: Number,
    quantity: Number,
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Shipped", "Delivered", "Rejected"],
      default: "Pending"
    }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      default: "Cash on Delivery"
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Shipped", "Delivered", "Rejected"],
      default: "Pending"
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: Date,
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    note: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
