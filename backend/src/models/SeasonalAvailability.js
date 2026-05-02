import mongoose from "mongoose";

const seasonalAvailabilitySchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // One schedule per farmer
    },
    crops: [
      {
        name: {
          type: String,
          required: true
        },
        months: [
          {
            type: Number,
            min: 1,
            max: 12
          }
        ],
        notes: {
          type: String
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const SeasonalAvailability = mongoose.model("SeasonalAvailability", seasonalAvailabilitySchema);
export default SeasonalAvailability;
