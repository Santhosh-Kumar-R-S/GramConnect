import asyncHandler from "express-async-handler";
import FarmUpdate from "../models/FarmUpdate.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup multer for local file storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `update-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Images only!"));
  }
});

export const uploadUpdateImage = upload.single("image");

// @desc    Create a new farm update
// @route   POST /api/farm-updates
// @access  Private (Farmer)
const createUpdate = asyncHandler(async (req, res) => {
  if (req.user.role !== "farmer") {
    res.status(403);
    throw new Error("Only farmers can post updates");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image");
  }

  const { caption } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  const update = await FarmUpdate.create({
    farmer: req.user._id,
    caption: caption || "",
    imageUrl
  });

  res.status(201).json(update);
});

// @desc    Get all farm updates (Global Feed)
// @route   GET /api/farm-updates
// @access  Public
const getFeed = asyncHandler(async (req, res) => {
  const updates = await FarmUpdate.find()
    .populate("farmer", "name village profileImage")
    .sort("-createdAt")
    .limit(50); // Fetch latest 50
  res.json(updates);
});

// @desc    Get updates for a specific farmer
// @route   GET /api/farm-updates/farmer/:farmerId
// @access  Public
const getFarmerUpdates = asyncHandler(async (req, res) => {
  const updates = await FarmUpdate.find({ farmer: req.params.farmerId })
    .populate("farmer", "name village")
    .sort("-createdAt");
  res.json(updates);
});

// @desc    Like a farm update
// @route   POST /api/farm-updates/:id/like
// @access  Public
const likeUpdate = asyncHandler(async (req, res) => {
  const update = await FarmUpdate.findById(req.params.id);
  if (!update) {
    res.status(404);
    throw new Error("Update not found");
  }
  
  // For MVP, just increment. 
  // In a real app, track which user liked to prevent multiple likes.
  update.likes += 1;
  await update.save();
  
  res.json(update);
});

// @desc    Update a farm update (caption only)
// @route   PUT /api/farm-updates/:id
// @access  Private (Farmer only)
const updateUpdate = asyncHandler(async (req, res) => {
  const update = await FarmUpdate.findById(req.params.id);

  if (!update) {
    res.status(404);
    throw new Error("Update not found");
  }

  // Check if the current user is the owner
  if (update.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to edit this update");
  }

  update.caption = req.body.caption || update.caption;
  const updatedUpdate = await update.save();

  res.json(updatedUpdate);
});

// @desc    Delete a farm update
// @route   DELETE /api/farm-updates/:id
// @access  Private (Farmer only)
const deleteUpdate = asyncHandler(async (req, res) => {
  const update = await FarmUpdate.findById(req.params.id);

  if (!update) {
    res.status(404);
    throw new Error("Update not found");
  }

  // Check if the current user is the owner
  if (update.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to delete this update");
  }

  // Optionally, you could also delete the image file from the server here
  // if (update.imageUrl) {
  //   const filePath = path.join(process.cwd(), update.imageUrl);
  //   if (fs.existsSync(filePath)) {
  //     fs.unlinkSync(filePath);
  //   }
  // }

  await FarmUpdate.deleteOne({ _id: update._id });

  res.json({ message: "Update removed" });
});

export { createUpdate, getFeed, getFarmerUpdates, likeUpdate, updateUpdate, deleteUpdate };
