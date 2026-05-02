import asyncHandler from "express-async-handler";
import crypto from "crypto";
import SplitPayment from "../models/SplitPayment.js";
import Order from "../models/Order.js";

// @desc    Initiate a Split Payment
// @route   POST /api/split-payments/initiate
// @access  Private
const initiateSplitPayment = asyncHandler(async (req, res) => {
  const { orderId, contributors } = req.body;
  // contributors = [{ email, amountAllocated, name }]

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const groupId = crypto.randomBytes(8).toString("hex");

  const splitPayment = await SplitPayment.create({
    orderId,
    groupId,
    initiatorId: req.user._id,
    totalAmount: order.totalAmount,
    contributors: contributors.map(c => ({
      userId: c.userId, // Can be null if unregistered
      name: c.name,
      amountAllocated: c.amountAllocated,
      status: "pending",
    }))
  });

  res.status(201).json(splitPayment);
});

// @desc    Get Split Payment Details by Group ID
// @route   GET /api/split-payments/:groupId
// @access  Public
const getSplitPayment = asyncHandler(async (req, res) => {
  const splitPayment = await SplitPayment.findOne({ groupId: req.params.groupId })
    .populate("initiatorId", "name email")
    .populate("orderId", "items totalAmount status");

  if (!splitPayment) {
    res.status(404);
    throw new Error("Split payment not found");
  }

  res.json(splitPayment);
});

// @desc    Contribute to Split Payment
// @route   POST /api/split-payments/:groupId/contribute
// @access  Private
const contributeSplitPayment = asyncHandler(async (req, res) => {
  const { contributorId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const splitPayment = await SplitPayment.findOne({ groupId: req.params.groupId });

  if (!splitPayment) {
    res.status(404);
    throw new Error("Split payment not found");
  }

  // 1. Verify Razorpay Signature
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret_123456";
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(body.toString())
    .digest("hex");

  const isTestMode = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "rzp_test_dummykey123";
  const signatureValid = isTestMode || expectedSignature === razorpay_signature;

  if (!signatureValid) {
    res.status(400);
    throw new Error("Invalid payment signature");
  }

  // 2. Update Contributor Status
  const contributor = splitPayment.contributors.id(contributorId);
  if (!contributor) {
    res.status(404);
    throw new Error("Contributor not found");
  }

  if (contributor.status === "paid") {
    res.status(400);
    throw new Error("Already paid");
  }

  contributor.status = "paid";
  contributor.amountPaid = contributor.amountAllocated;
  contributor.razorpayPaymentId = razorpay_payment_id;

  // 3. Update Totals
  splitPayment.collectedAmount += contributor.amountPaid;

  // 4. Check if fully paid
  if (splitPayment.collectedAmount >= splitPayment.totalAmount) {
    splitPayment.status = "completed";
    
    // Mark order as paid
    const order = await Order.findById(splitPayment.orderId);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentMethod = "Split/Group";
      await order.save();
    }
  }

  await splitPayment.save();
  res.json({ message: "Contribution successful", splitPayment });
});

export { initiateSplitPayment, getSplitPayment, contributeSplitPayment };
