import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { initiateSplitPayment, getSplitPayment, contributeSplitPayment, createContributorOrder } from "../controllers/splitPaymentController.js";

const router = express.Router();

router.post("/initiate", protect, initiateSplitPayment);
router.get("/:groupId", getSplitPayment);
router.post("/:groupId/create-order", protect, createContributorOrder);
router.post("/:groupId/contribute", protect, contributeSplitPayment);

export default router;
