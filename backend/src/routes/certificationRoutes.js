import express from "express";
import { uploadCertification, getMyCertifications, getPendingCertifications, verifyCertification, uploadMiddleware } from "../controllers/certificationController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, uploadMiddleware, uploadCertification);

router.get("/mine", protect, getMyCertifications);

router.get("/pending", protect, authorizeRoles("admin"), getPendingCertifications);
router.put("/:id/verify", protect, authorizeRoles("admin"), verifyCertification);

export default router;
