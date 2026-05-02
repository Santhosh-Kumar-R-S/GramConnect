import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  listFarmers,
  updateFarmerStatus,
  createCategory,
  getCategories,
  getUsers,
  listOrders,
  analytics
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/farmers", listFarmers);
router.patch("/farmers/:id/approval", updateFarmerStatus);
router.post("/categories", createCategory);
router.get("/categories", getCategories);
router.get("/users", getUsers);
router.get("/orders", listOrders);
router.get("/analytics", analytics);

export default router;
