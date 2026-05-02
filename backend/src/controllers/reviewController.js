import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private/Consumer
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if user already reviewed
  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user._id
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("Product already reviewed");
  }

  // Verify if user actually purchased and order is delivered
  const order = await Order.findOne({
    consumer: req.user._id,
    "orderItems.product": productId,
    status: "Delivered"
  });

  const review = new Review({
    rating: Number(rating),
    comment,
    product: productId,
    user: req.user._id,
    verifiedPurchase: !!order
  });

  await review.save();

  // Update product average rating
  const reviews = await Review.find({ product: productId });
  product.numReviews = reviews.length;
  product.rating =
    reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  await product.save();

  res.status(201).json({ message: "Review added", review });
});

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id }).populate(
    "user",
    "name"
  );
  res.json(reviews);
});

export { createProductReview, getProductReviews };
