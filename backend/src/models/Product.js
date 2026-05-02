import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: "kg"
    },
    harvestDate: {
      type: Date
    },
    location: {
      type: String
    },
    geoCoordinates: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
      }
    },
    pincode: {
      type: String
    },
    description: {
      type: String
    },
    images: [
      {
        type: String
      }
    ],
    minOrderQuantity: {
      type: Number,
      default: 1
    },
    bulkPricingTiers: [
      {
        quantity: Number,
        price: Number
      }
    ],
    rating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({ geoCoordinates: "2dsphere" });

const Product = mongoose.model("Product", productSchema);
export default Product;
