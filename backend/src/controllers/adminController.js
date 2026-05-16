import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

const listFarmers = asyncHandler(async (req, res) => {
  const filter = { role: "farmer" };
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const farmers = await User.find(filter)
    .select("name email village location status createdAt")
    .sort("-createdAt");
  res.json(farmers);
});

const updateFarmerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const farmer = await User.findById(req.params.id);

  if (!farmer || farmer.role !== "farmer") {
    res.status(404);
    throw new Error("Farmer not found");
  }

  farmer.status = status;
  await farmer.save();
  res.json(farmer);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;

  const exists = await Category.findOne({ slug });
  if (exists) {
    res.status(400);
    throw new Error("Category slug already exists");
  }

  const category = await Category.create({ name, slug, description });
  res.status(201).json(category);
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort("name");
  res.json(categories);
});

const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;

  const users = await User.find(filter)
    .select("name email role status createdAt village state")
    .sort("-createdAt");
  res.json(users);
});

const listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("consumer", "name location")
    .populate("items.farmer", "name village")
    .populate("items.product", "category name")
    .sort("-createdAt");
  res.json(orders);
});

const analytics = asyncHandler(async (req, res) => {
  const totalFarmers = await User.countDocuments({ role: "farmer" });
  const totalConsumers = await User.countDocuments({ role: "consumer" });
  const totalOrders = await Order.countDocuments();
  const acceptedOrders = await Order.countDocuments({ status: "Accepted" });

  res.json({
    totalFarmers,
    totalConsumers,
    totalOrders,
    acceptedOrders
  });
});

const clearFarmerEarnings = asyncHandler(async (req, res) => {
  const farmerId = req.params.id;
  
  const orders = await Order.find({
    "items.farmer": farmerId,
    "items.isCleared": { $ne: true }
  });

  let totalCleared = 0;

  for (const order of orders) {
    let orderUpdated = false;
    order.items.forEach(item => {
      if (item.farmer.toString() === farmerId && !item.isCleared) {
        item.isCleared = true;
        item.clearedAt = new Date();
        totalCleared += (item.price * item.quantity);
        orderUpdated = true;
      }
    });

    if (orderUpdated) {
      await order.save();
    }
  }

  res.json({ message: "Earnings cleared successfully", totalCleared });
});

const getFarmerEarnings = asyncHandler(async (req, res) => {
  const farmerId = req.params.id;
  
  const orders = await Order.find({ "items.farmer": farmerId }).sort("-createdAt");
  
  let pendingEarnings = 0;
  let clearedEarnings = 0;
  const earningsDetails = [];

  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.farmer.toString() === farmerId) {
        const amount = item.price * item.quantity;
        if (item.isCleared) {
          clearedEarnings += amount;
        } else {
          pendingEarnings += amount;
        }

        earningsDetails.push({
          orderId: order._id,
          date: order.createdAt,
          amount,
          isCleared: item.isCleared || false,
          clearedAt: item.clearedAt,
          productName: item.name
        });
      }
    });
  });

  res.json({
    pendingEarnings,
    clearedEarnings,
    details: earningsDetails
  });
});

export { listFarmers, updateFarmerStatus, createCategory, getCategories, getUsers, listOrders, analytics, clearFarmerEarnings, getFarmerEarnings };
