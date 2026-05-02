import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"]
    },
    village: {
      type: String
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
        type: [Number], // [longitude, latitude]
      }
    },
    pincode: {
      type: String
    },
    crops: [
      {
        type: String
      }
    ],
    role: {
      type: String,
      enum: ["farmer", "consumer", "admin"],
      default: "consumer"
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    otpCode: String,
    otpExpires: Date
  },
  {
    timestamps: true
  }
);

userSchema.index({ geoCoordinates: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (this.isNew && (this.role === "consumer" || this.role === "admin")) {
    this.status = "approved";
  }

  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
