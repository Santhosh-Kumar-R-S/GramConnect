import express from "express";
import {
  registerUser,
  loginUser,
  requestOtp,
  verifyOtp,
  getMe,
  updateUserProfile
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.route("/profile").get(protect, getMe).put(protect, updateUserProfile);

export default router;
