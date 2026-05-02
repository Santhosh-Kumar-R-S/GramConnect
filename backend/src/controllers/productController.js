import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

const createProduct = asyncHandler(async (req, res) => {
  if (req.user.role === "farmer" && req.user.status !== "approved") {
    res.status(403);
    throw new Error("Account not approved. improved visuals? You cannot list products yet.");
  }

  const { name, category, price, quantity, unit, harvestDate, location, description, images, minOrderQuantity, bulkPricingTiers, geoCoordinates, pincode } = req.body;
  const product = await Product.create({
    farmer: req.user._id,
    name,
    category,
    price,
    quantity,
    unit,
    harvestDate,
    location,
    description,
    images,
    minOrderQuantity,
    bulkPricingTiers,
    geoCoordinates,
    pincode
  });

  res.status(201).json(product);
});

const listFarmerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ farmer: req.user._id }).sort("-createdAt");
  res.json(products);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only manage your own products");
  }

  const updates = ["name", "category", "price", "quantity", "unit", "harvestDate", "location", "description"];
  updates.forEach((field) => {
    if (field in req.body) {
      product[field] = req.body[field];
    }
  });

  await product.save();
  res.json(product);
});

const listProducts = asyncHandler(async (req, res) => {
  const { category, location, minPrice, maxPrice, search, lat, lng, maxDistance = 50000, maxAgeDays, minQty } = req.query;
  const filters = {};

  if (category) {
    filters.category = category;
  }

  if (search) {
    filters.name = { $regex: search, $options: "i" };
  }

  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  if (lat && lng) {
    filters.geoCoordinates = {
      $near: {
        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(maxDistance)
      }
    };
  } else if (location) {
    filters.$or = [
      { location: { $regex: location, $options: "i" } },
      { pincode: { $regex: location, $options: "i" } }
    ];
  }

  if (maxAgeDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(maxAgeDays));
    filters.harvestDate = { $gte: cutoffDate };
  }

  if (minQty) {
    filters.minOrderQuantity = { $lte: parseInt(minQty) };
  }

  const products = await Product.find(filters)
    .populate("farmer", "name village location crops rating")
    .sort(lat && lng ? undefined : "-createdAt"); // $near automatically sorts by distance

  res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("farmer", "name village location crops");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only manage your own products");
  }

  await Product.deleteOne({ _id: product._id });
  res.json({ message: "Product removed" });
});

export { createProduct, listFarmerProducts, updateProduct, listProducts, getProductById, deleteProduct };
