import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ["Organic", "FSSAI", "GAP", "Other"],
      default: "Organic"
    },
    documentUrl: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" // Admin who verified
    },
    rejectionReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Certification = mongoose.model("Certification", certificationSchema);
export default Certification;
