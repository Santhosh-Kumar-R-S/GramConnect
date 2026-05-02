import express from "express";
import { getNearbyFarms, getFarmerProfile } from "../controllers/farmMapController.js";

const router = express.Router();

router.get("/nearby", getNearbyFarms);
router.get("/:farmerId/profile", getFarmerProfile);

export default router;
