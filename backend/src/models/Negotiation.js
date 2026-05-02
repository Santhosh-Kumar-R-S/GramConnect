import mongoose from "mongoose";

const negotiationSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    requestedPrice: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"],
      default: "PENDING"
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

negotiationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Negotiation = mongoose.model("Negotiation", negotiationSchema);
export default Negotiation;
