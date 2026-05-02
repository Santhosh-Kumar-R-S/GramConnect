import asyncHandler from "express-async-handler";
import Negotiation from "../models/Negotiation.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";

// @desc    Initiate a new negotiation
// @route   POST /api/negotiations
// @access  Private/Consumer
const createNegotiation = asyncHandler(async (req, res) => {
  const { productId, requestedPrice, quantity } = req.body;

  const product = await Product.findById(productId).populate('farmer');

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (quantity < product.minOrderQuantity) {
    res.status(400);
    throw new Error(`Minimum order quantity is ${product.minOrderQuantity}`);
  }

  const negotiation = new Negotiation({
    consumer: req.user._id,
    farmer: product.farmer._id,
    product: productId,
    requestedPrice,
    quantity,
    status: "PENDING"
  });

  await negotiation.save();

  await Notification.create({
    user: product.farmer._id,
    message: `New bulk negotiation request for ${product.name}`,
    data: { negotiationId: negotiation._id }
  });

  res.status(201).json(negotiation);
});

// @desc    Respond to negotiation (Accept/Reject)
// @route   PATCH /api/negotiations/:id
// @access  Private/Farmer
const respondToNegotiation = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const negotiation = await Negotiation.findById(req.params.id).populate('product');

  if (!negotiation) {
    res.status(404);
    throw new Error("Negotiation not found");
  }

  if (negotiation.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  negotiation.status = status;
  
  if (status === "ACCEPTED") {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    negotiation.expiresAt = expiresAt;
  }

  await negotiation.save();

  await Notification.create({
    user: negotiation.consumer,
    message: `Your negotiation for ${negotiation.product.name} was ${status.toLowerCase()}`,
    data: { negotiationId: negotiation._id }
  });

  res.json(negotiation);
});

// @desc    Get user negotiations (Farmer or Consumer)
// @route   GET /api/negotiations
// @access  Private
const getNegotiations = asyncHandler(async (req, res) => {
  const query = req.user.role === 'farmer' ? { farmer: req.user._id } : { consumer: req.user._id };
  const negotiations = await Negotiation.find(query)
    .populate('product', 'name images unit')
    .populate(req.user.role === 'farmer' ? 'consumer' : 'farmer', 'name')
    .sort('-createdAt');
    
  res.json(negotiations);
});

export { createNegotiation, respondToNegotiation, getNegotiations };
