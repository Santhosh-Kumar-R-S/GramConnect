import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import farmerRoutes from "./routes/farmerRoutes.js";
import consumerRoutes from "./routes/consumerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import negotiationRoutes from "./routes/negotiationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import farmMapRoutes from "./routes/farmMapRoutes.js";
import seasonalRoutes from "./routes/seasonalRoutes.js";
import certificationRoutes from "./routes/certificationRoutes.js";
import updateRoutes from "./routes/updateRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*"
  })
);

app.get("/health", (req, res) => {
  res.send({ status: "ok", service: "GramConnect API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/consumer", consumerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/farms", farmMapRoutes);
app.use("/api/seasonal", seasonalRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/farm-updates", updateRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`GramConnect backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection", reason);
  process.exit(1);
});
