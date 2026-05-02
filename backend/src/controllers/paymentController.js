import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Order from "../models/Order.js";

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  const isTestMode = !key_id || key_id === "rzp_test_dummykey123";

  if (isTestMode) {
    const fakeOrderId = `order_test_${Date.now()}`;
    order.razorpayOrderId = fakeOrderId;
    await order.save();
    return res.json({
      id: fakeOrderId,
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      _testMode: true
    });
  }

  // Call Razorpay REST API directly (avoids SDK dependency issues)
  const body = {
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: `receipt_${order._id}`
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
    const errText = await response.text();
    console.error("Razorpay error:", errText);
    res.status(500);
    throw new Error("Failed to create Razorpay order");
  }

  const razorpayOrder = await response.json();

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json({
    id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency
  });
});

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret_123456";

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(body.toString())
    .digest("hex");

  // In test/demo mode, always mark as paid
  const isTestMode = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "rzp_test_dummykey123";
  const signatureValid = isTestMode || expectedSignature === razorpay_signature;

  if (signatureValid) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = "Razorpay";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();
    res.json({ message: "Payment verified successfully", order });
  } else {
    res.status(400);
    throw new Error("Invalid payment signature");
  }
});

export { createRazorpayOrder, verifyPayment };
