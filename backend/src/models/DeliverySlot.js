import mongoose from "mongoose";

const deliverySlotSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    label: { type: String, required: true }, // e.g. "Morning (8am–12pm)"
    startTime: { type: String, required: true }, // "08:00"
    endTime: { type: String, required: true },   // "12:00"
    maxCapacity: { type: Number, required: true, default: 20 },
    bookedCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdByRole: { type: String, enum: ["admin", "farmer"], required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for fast date-based queries
deliverySlotSchema.index({ date: 1, isActive: 1 });

const DeliverySlot = mongoose.model("DeliverySlot", deliverySlotSchema);
export default DeliverySlot;
