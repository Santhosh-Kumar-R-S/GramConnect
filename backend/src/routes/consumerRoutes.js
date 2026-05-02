import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createOrder, getMyOrders } from "../controllers/orderController.js";

const router = express.Router();

router.use(protect);

router.route("/orders").post(createOrder).get(getMyOrders);

export default router;
