import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getSlots, createSlot, deleteSlot } from "../controllers/slotController.js";

const router = express.Router();

router.route("/").get(protect, getSlots).post(protect, createSlot);
router.route("/:id").delete(protect, deleteSlot);

export default router;
