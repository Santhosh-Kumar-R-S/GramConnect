import mongoose from "mongoose";

const contributorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: String,
  amountAllocated: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  razorpayPaymentId: String,
});

const splitPaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    groupId: {
      type: String, // Unique identifier for sharing links
      required: true,
      unique: true,
    },
    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    collectedAmount: {
      type: Number,
      default: 0,
    },
    contributors: [contributorSchema],
    status: {
      type: String,
      enum: ["pending", "completed", "expired"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const SplitPayment = mongoose.model("SplitPayment", splitPaymentSchema);
export default SplitPayment;
