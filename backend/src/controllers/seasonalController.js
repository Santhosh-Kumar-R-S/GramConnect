import asyncHandler from "express-async-handler";
import SeasonalAvailability from "../models/SeasonalAvailability.js";
import User from "../models/User.js";

// @desc    Get farmer's seasonal schedule
// @route   GET /api/seasonal/:farmerId
// @access  Public
const getFarmerSchedule = asyncHandler(async (req, res) => {
  const schedule = await SeasonalAvailability.findOne({ farmer: req.params.farmerId });
  
  if (!schedule) {
    return res.json({ crops: [] });
  }
  res.json(schedule);
});

// @desc    Create or update seasonal schedule
// @route   POST /api/seasonal
// @access  Private (Farmer)
const updateSchedule = asyncHandler(async (req, res) => {
  if (req.user.role !== "farmer") {
    res.status(403);
    throw new Error("Only farmers can update seasonal schedule");
  }

  const { crops } = req.body;

  let schedule = await SeasonalAvailability.findOne({ farmer: req.user._id });

  if (schedule) {
    schedule.crops = crops;
    await schedule.save();
  } else {
    schedule = await SeasonalAvailability.create({
      farmer: req.user._id,
      crops
    });
  }

  res.json(schedule);
});

// @desc    Get all farms with specific crop available this month
// @route   GET /api/seasonal/available?month=5
// @access  Public
const getAvailableFarms = asyncHandler(async (req, res) => {
  const month = parseInt(req.query.month) || new Date().getMonth() + 1; // 1-12
  
  const schedules = await SeasonalAvailability.find({
    "crops.months": month
  }).populate("farmer", "name village location geoCoordinates crops");

  res.json(schedules);
});

export { getFarmerSchedule, updateSchedule, getAvailableFarms };
