import express from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js'; // Required for populate('farmer') to work
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) {
            filters.category = req.query.category;
        }
        const products = await Product.find(filters).populate('farmer', 'name village district state');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('farmer', 'name village district state');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Farmer
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'farmer') {
        return res.status(401).json({ message: 'Not authorized as a farmer' });
    }

    const {
        name, category, description, pricePerUnit, unit, quantityAvailable, image, harvestDate, isOrganic
    } = req.body;

    try {
        const product = new Product({
            farmer: req.user._id,
            name,
            category,
            description,
            pricePerUnit,
            unit,
            quantityAvailable,
            image,
            harvestDate,
            isOrganic,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
