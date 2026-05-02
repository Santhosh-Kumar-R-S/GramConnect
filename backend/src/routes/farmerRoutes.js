import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createProduct,
  listFarmerProducts,
  updateProduct
} from "../controllers/productController.js";
import {
  listFarmerOrders,
  updateOrderStatus,
  farmerEarnings,
  getFarmerProfile
} from "../controllers/farmerController.js";

const router = express.Router();

router.route("/:id").get(getFarmerProfile);

router.use(protect, authorizeRoles("farmer"));

router.route("/products").post(createProduct).get(listFarmerProducts);
router.route("/products/:id").put(updateProduct);
router.route("/orders").get(listFarmerOrders);
router.route("/orders/:id/status").patch(updateOrderStatus);
router.get("/earnings", farmerEarnings);

export default router;
