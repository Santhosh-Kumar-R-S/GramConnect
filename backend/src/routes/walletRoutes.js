import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getWallet, processCashback } from "../controllers/walletController.js";

const router = express.Router();

router.route("/").get(protect, getWallet);
router.post("/cashback", protect, processCashback);

export default router;
