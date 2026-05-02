import mongoose from "mongoose";

const farmUpdateSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      required: true
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const FarmUpdate = mongoose.model("FarmUpdate", farmUpdateSchema);
export default FarmUpdate;
