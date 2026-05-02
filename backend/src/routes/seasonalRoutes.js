import express from "express";
import { getFarmerSchedule, updateSchedule, getAvailableFarms } from "../controllers/seasonalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/available", getAvailableFarms);
router.route("/").post(protect, updateSchedule);
router.get("/:farmerId", getFarmerSchedule);

export default router;
