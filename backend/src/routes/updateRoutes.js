import express from "express";
import { createUpdate, getFeed, getFarmerUpdates, likeUpdate, uploadUpdateImage, updateUpdate, deleteUpdate } from "../controllers/updateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getFeed)
  .post(protect, uploadUpdateImage, createUpdate);

router.get("/farmer/:farmerId", getFarmerUpdates);
router.post("/:id/like", likeUpdate);

router.route("/:id")
  .put(protect, updateUpdate)
  .delete(protect, deleteUpdate);

export default router;
