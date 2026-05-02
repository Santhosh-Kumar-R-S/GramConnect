import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, totalAmount, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  const order = new Order({
    consumer: req.user._id,
    items,
    totalAmount,
    shippingAddress
  });

  const createdOrder = await order.save();

  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  if (req.user.role === 'consumer') {
    const orders = await Order.find({ consumer: req.user._id })
      .populate('consumer', 'name email')
      .populate('items.product', 'name category price unit');
    res.json(orders);
  } else if (req.user.role === 'farmer') {
    // Find all orders that contain at least one item from this farmer
    const orders = await Order.find({ "items.farmer": req.user._id })
      .populate('consumer', 'name email');
    
    // Filter the items array so the farmer only sees their own items
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(
        item => item.farmer.toString() === req.user._id.toString()
      );
      // Recalculate total for this specific farmer's items (optional, but good for display)
      orderObj.totalAmount = orderObj.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      return orderObj;
    });

    res.json(filteredOrders);
  } else {
    res.status(403);
    throw new Error("Not authorized as consumer or farmer");
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  await order.save();

  res.json(order);
});

export { createOrder, getMyOrders, updateOrderStatus };
