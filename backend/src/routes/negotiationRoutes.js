import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createNegotiation, respondToNegotiation, getNegotiations } from "../controllers/negotiationController.js";

const router = express.Router();

router.route("/")
  .post(protect, createNegotiation)
  .get(protect, getNegotiations);

router.route("/:id")
  .patch(protect, respondToNegotiation);

export default router;
