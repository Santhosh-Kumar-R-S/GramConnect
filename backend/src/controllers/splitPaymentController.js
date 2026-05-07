import asyncHandler from "express-async-handler";
import crypto from "crypto";
import SplitPayment from "../models/SplitPayment.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

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

  const processedContributors = await Promise.all(contributors.map(async (c) => {
    let userId = c.userId;
    let name = c.name;

    if (c.email) {
      const user = await User.findOne({ email: c.email });
      if (user) {
        userId = user._id;
        name = user.name;
      } else {
        name = name || c.email;
      }
    }

    return {
      userId,
      name,
      amountAllocated: c.amountAllocated,
      status: "pending",
    };
  }));

  const splitPayment = await SplitPayment.create({
    orderId,
    groupId,
    initiatorId: req.user._id,
    totalAmount: order.totalAmount,
    contributors: processedContributors
  });

  // Create notifications for registered friends
  for (const c of processedContributors) {
    if (c.userId && c.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: c.userId,
        title: "Split Payment Request",
        message: `${req.user.name} has requested you to pay ₹${c.amountAllocated} for a shared order.`,
        type: "system",
        link: `/consumer/split-payment/${groupId}`
      });
    }
  }

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

// @desc    Create Razorpay Order for Split Payment Contributor
// @route   POST /api/split-payments/:groupId/create-order
// @access  Private
const createContributorOrder = asyncHandler(async (req, res) => {
  const { contributorId } = req.body;
  const splitPayment = await SplitPayment.findOne({ groupId: req.params.groupId });

  if (!splitPayment) {
    res.status(404);
    throw new Error("Split payment not found");
  }

  const contributor = splitPayment.contributors.id(contributorId);
  if (!contributor) {
    res.status(404);
    throw new Error("Contributor not found");
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  const isTestMode = !key_id || key_id === "rzp_test_dummykey123";

  if (isTestMode) {
    return res.json({
      id: `order_test_${Date.now()}`,
      amount: Math.round(contributor.amountAllocated * 100),
      currency: "INR",
      _testMode: true
    });
  }

  const body = {
    amount: Math.round(contributor.amountAllocated * 100),
    currency: "INR",
    receipt: `receipt_split_${contributor._id}`
  };

  const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    res.status(500);
    throw new Error("Failed to create Razorpay order");
  }

  const razorpayOrder = await response.json();
  res.json({
    id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency
  });
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

    // Notify Initiator
    await Notification.create({
      user: splitPayment.initiatorId,
      title: "Split Payment Completed",
      message: `Your split payment group has fully paid the total amount of ₹${splitPayment.totalAmount}. The order is now officially placed!`,
      type: "success",
      link: "/consumer/orders"
    });
  }

  await splitPayment.save();
  res.json({ message: "Contribution successful", splitPayment });
});

export { initiateSplitPayment, getSplitPayment, contributeSplitPayment, createContributorOrder };
