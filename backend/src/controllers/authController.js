import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { createOTP } from "../utils/otpHelper.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = "consumer", village, location, crops = [] } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    village,
    location,
    crops
  });

  res.status(201).json({
    message:
      user.role === "farmer"
        ? "Farmers require admin approval before listing produce"
        : "Welcome to GramConnect",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.role === "farmer" && user.status !== "approved") {
    res.status(403);
    throw new Error("Your farm profile is pending approval");
  }

  const token = generateToken(user._id, user.role);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  });
});

const requestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { otpCode, expires } = createOTP();
  user.otpCode = otpCode;
  user.otpExpires = expires;

  await user.save();
  res.json({
    message: "OTP generated - use this code to log in within 10 minutes",
    otpCode // in a real app, you would send via SMS/Email
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otpCode } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otpCode !== otpCode || user.otpExpires < Date.now()) {
    res.status(400);
    throw new Error("OTP invalid or expired");
  }

  const token = generateToken(user._id, user.role);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export { registerUser, loginUser, requestOtp, verifyOtp, getMe };
