import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

router.route("/").post(protect, createOrder);
router.route("/myorders").get(protect, getMyOrders);
router.route("/:orderId/status").put(protect, updateOrderStatus);

export default router;
