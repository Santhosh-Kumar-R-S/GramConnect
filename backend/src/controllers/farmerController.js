import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import Farmer from "../models/Farmer.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const listFarmerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ farmer: req.user._id })
    .populate("consumer", "name location")
    .sort("-createdAt");

  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only manage your own orders");
  }

  order.status = status;
  const updated = await order.save();

  await Notification.create({
    user: order.consumer,
    message: `Farmer marked your order as ${status}`,
    data: { orderId: order._id, status }
  });

  res.json(updated);
});

const farmerEarnings = asyncHandler(async (req, res) => {
  const delivered = await Order.find({
    farmer: req.user._id,
    status: { $in: ["Accepted", "Delivered"] }
  });

  const pending = await Order.countDocuments({ farmer: req.user._id, status: "Pending" });

  const totalEarned = delivered.reduce((sum, order) => sum + order.totalAmount, 0);

  res.json({
    totalEarned,
    deliveredOrders: delivered.length,
    pendingOrders: pending
  });
});

// @desc    Get farmer profile and products
// @route   GET /api/farmers/:id
// @access  Public
const getFarmerProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user || user.role !== "farmer") {
    res.status(404);
    throw new Error("Farmer not found");
  }

  const profile = await Farmer.findOne({ user: req.params.id });
  const products = await Product.find({ farmer: req.params.id }).sort("-createdAt");

  res.json({
    user,
    profile: profile || {},
    products
  });
});

export { listFarmerOrders, updateOrderStatus, farmerEarnings, getFarmerProfile };
