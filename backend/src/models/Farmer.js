import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    story: {
      type: String,
      default: ""
    },
    farmImages: [
      {
        type: String
      }
    ],
    experienceYears: {
      type: Number,
      default: 0
    },
    certifications: [
      {
        type: String
      }
    ],
    rating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    isOrganicVerified: {
      type: Boolean,
      default: false
    },
    organicVerifiedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Farmer = mongoose.model("Farmer", farmerSchema);
export default Farmer;
