import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createProduct,
  listFarmerProducts,
  updateProduct,
  listProducts,
  getProductById,
  deleteProduct
} from "../controllers/productController.js";
import { createProductReview, getProductReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.route("/").get(listProducts).post(protect, createProduct);
router.route("/farmer").get(protect, listFarmerProducts);
router.route("/:id").get(getProductById).put(protect, updateProduct).delete(protect, deleteProduct);
router.route("/:id/reviews").post(protect, createProductReview).get(getProductReviews);

export default router;
