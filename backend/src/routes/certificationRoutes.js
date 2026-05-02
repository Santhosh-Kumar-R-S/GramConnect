import express from "express";
import { uploadCertification, getMyCertifications, getPendingCertifications, verifyCertification, uploadMiddleware } from "../controllers/certificationController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, uploadMiddleware, uploadCertification);

router.get("/mine", protect, getMyCertifications);

router.get("/pending", protect, admin, getPendingCertifications);
router.put("/:id/verify", protect, admin, verifyCertification);

export default router;
