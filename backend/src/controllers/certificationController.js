import asyncHandler from "express-async-handler";
import Certification from "../models/Certification.js";
import Farmer from "../models/Farmer.js";
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
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Images and PDFs only!"));
  }
});

// Export multer middleware
export const uploadMiddleware = upload.single("document");

// @desc    Upload a certification document
// @route   POST /api/certifications
// @access  Private (Farmer)
const uploadCertification = asyncHandler(async (req, res) => {
  if (req.user.role !== "farmer") {
    res.status(403);
    throw new Error("Only farmers can upload certifications");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a document");
  }

  const { type } = req.body;
  const documentUrl = `/uploads/${req.file.filename}`;

  const cert = await Certification.create({
    farmer: req.user._id,
    type: type || "Organic",
    documentUrl
  });

  res.status(201).json(cert);
});

// @desc    Get my certifications
// @route   GET /api/certifications/mine
// @access  Private (Farmer)
const getMyCertifications = asyncHandler(async (req, res) => {
  const certs = await Certification.find({ farmer: req.user._id }).sort("-createdAt");
  res.json(certs);
});

// @desc    Get pending certifications
// @route   GET /api/certifications/pending
// @access  Private (Admin)
const getPendingCertifications = asyncHandler(async (req, res) => {
  const certs = await Certification.find({ status: "pending" })
    .populate("farmer", "name village email")
    .sort("createdAt");
  res.json(certs);
});

// @desc    Verify certification (approve/reject)
// @route   PUT /api/certifications/:id/verify
// @access  Private (Admin)
const verifyCertification = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body; // 'approved' or 'rejected'

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const cert = await Certification.findById(req.params.id);
  if (!cert) {
    res.status(404);
    throw new Error("Certification not found");
  }

  cert.status = status;
  cert.verifiedBy = req.user._id;
  
  if (status === "rejected") {
    cert.rejectionReason = rejectionReason;
  }
  
  await cert.save();

  // If organic approved, update farmer profile
  if (status === "approved" && cert.type === "Organic") {
    const farmerProfile = await Farmer.findOne({ user: cert.farmer });
    if (farmerProfile) {
      farmerProfile.isOrganicVerified = true;
      farmerProfile.organicVerifiedAt = Date.now();
      await farmerProfile.save();
    }
  }

  res.json(cert);
});

export { uploadCertification, getMyCertifications, getPendingCertifications, verifyCertification };
