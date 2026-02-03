import express from 'express';
import Order from '../models/Order.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    const { items, shippingAddress, totalAmount } = req.body;

    if (items && items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const order = new Order({
            consumer: req.user._id,
            items,
            shippingAddress,
            totalAmount,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        // If consumer, find orders where they are the consumer
        // If farmer, find orders containing their products (this logic is complex for MVP, simplified to consumer view first)
        // For MVP transparency: A user sees orders they placed.

        // Complex query for Farmers seeing orders containing their items could go here.
        // Simplifying: List orders where user is Consumer OR one of the items belongs to Farmer.

        let orders;
        if (req.user.role === 'farmer') {
            orders = await Order.find({ 'items.farmer': req.user._id }).populate('consumer', 'name email');
        } else {
            orders = await Order.find({ consumer: req.user._id });
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized as admin' });
        }
        const orders = await Order.find({})
            .populate('consumer', 'id name')
            .populate('items.product', 'name'); // Optional: populate product details
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
