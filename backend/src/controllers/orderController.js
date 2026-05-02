import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import DeliverySlot from "../models/DeliverySlot.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, totalAmount, shippingAddress, deliverySlotId } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // Handle delivery slot booking
  if (deliverySlotId) {
    const slot = await DeliverySlot.findById(deliverySlotId);
    if (!slot) {
      res.status(404);
      throw new Error("Delivery slot not found");
    }
    if (slot.bookedCount >= slot.maxCapacity) {
      res.status(400);
      throw new Error("Delivery slot is fully booked");
    }
    slot.bookedCount += 1;
    await slot.save();
  }

  const order = new Order({
    consumer: req.user._id,
    items,
    totalAmount,
    shippingAddress,
    deliverySlot: deliverySlotId || undefined,
    statusHistory: [{ status: "Pending", updatedBy: req.user._id }]
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  if (req.user.role === "consumer") {
    const orders = await Order.find({ consumer: req.user._id })
      .populate("consumer", "name email")
      .populate("deliverySlot")
      .populate("items.product", "name category price unit")
      .sort({ createdAt: -1 });
    res.json(orders);
  } else if (req.user.role === "farmer") {
    const orders = await Order.find({ "items.farmer": req.user._id })
      .populate("consumer", "name email")
      .populate("deliverySlot")
      .sort({ createdAt: -1 });

    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(
        item => item.farmer.toString() === req.user._id.toString()
      );
      orderObj.totalAmount = orderObj.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      return orderObj;
    });

    res.json(filteredOrders);
  } else {
    res.status(403);
    throw new Error("Not authorized");
  }
});

// @desc    Update order status (with history tracking)
// @route   PUT /api/orders/:orderId/status
// @access  Private (Farmer / Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note } = req.body;

  const validStatuses = ["Pending", "Accepted", "Packed", "Shipped", "Delivered", "Rejected"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  order.statusHistory.push({
    status,
    note: note || "",
    updatedBy: req.user._id,
    timestamp: new Date()
  });

  await order.save();
  res.json(order);
});

export { createOrder, getMyOrders, updateOrderStatus };
