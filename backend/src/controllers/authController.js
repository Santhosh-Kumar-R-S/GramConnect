import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { createOTP } from "../utils/otpHelper.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = "consumer", village, location, crops = [], lat, lng } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  let geoCoordinates;
  if (lat && lng) {
    geoCoordinates = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)]
    };
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    village,
    location,
    crops,
    ...(geoCoordinates && { geoCoordinates })
  });

  const token = generateToken(user._id, user.role);
  
  res.status(201).json({
    message:
      user.role === "farmer"
        ? "Farmers require admin approval before listing produce"
        : "Welcome to GramConnect",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      village: user.village,
      location: user.location,
      pincode: user.pincode
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

  // Allow login even if pending so they can see the pending status page

  const token = generateToken(user._id, user.role);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      village: user.village,
      location: user.location,
      pincode: user.pincode
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
      status: user.status,
      village: user.village,
      location: user.location,
      pincode: user.pincode
    }
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.village = req.body.village || user.village;
    user.location = req.body.location || user.location;
    user.pincode = req.body.pincode || user.pincode;

    // Do NOT update email here based on user request ("not the user name(means mail)")
    // Do NOT update role or status here

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      village: updatedUser.village,
      location: updatedUser.location,
      pincode: updatedUser.pincode,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { registerUser, loginUser, requestOtp, verifyOtp, getMe, updateUserProfile };
