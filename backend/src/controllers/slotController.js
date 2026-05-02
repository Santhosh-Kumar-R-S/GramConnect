import asyncHandler from "express-async-handler";
import DeliverySlot from "../models/DeliverySlot.js";

// @desc    Get available delivery slots (next 7 days, not full)
// @route   GET /api/slots
// @access  Private
const getSlots = asyncHandler(async (req, res) => {
  const now = new Date();
  const weekLater = new Date();
  weekLater.setDate(now.getDate() + 7);

  const slots = await DeliverySlot.find({
    date: { $gte: now, $lte: weekLater },
    isActive: true
  })
    .populate("createdBy", "name role")
    .sort({ date: 1, startTime: 1 });

  // Admin slots first, then farmer slots
  const adminSlots = slots.filter(s => s.createdByRole === "admin");
  const farmerSlots = slots.filter(s => s.createdByRole === "farmer");

  res.json([...adminSlots, ...farmerSlots]);
});

// @desc    Create a delivery slot
// @route   POST /api/slots
// @access  Private (Admin or Farmer)
const createSlot = asyncHandler(async (req, res) => {
  const { date, label, startTime, endTime, maxCapacity } = req.body;

  if (!date || !label || !startTime || !endTime) {
    res.status(400);
    throw new Error("Please provide all required slot fields");
  }

  const slot = await DeliverySlot.create({
    date: new Date(date),
    label,
    startTime,
    endTime,
    maxCapacity: maxCapacity || 20,
    createdBy: req.user._id,
    createdByRole: req.user.role
  });

  res.status(201).json(slot);
});

// @desc    Delete a delivery slot
// @route   DELETE /api/slots/:id
// @access  Private (Admin or Farmer who owns it)
const deleteSlot = asyncHandler(async (req, res) => {
  const slot = await DeliverySlot.findById(req.params.id);

  if (!slot) {
    res.status(404);
    throw new Error("Slot not found");
  }

  const isAdmin = req.user.role === "admin";
  const isOwner = slot.createdBy.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    res.status(401);
    throw new Error("Not authorized to delete this slot");
  }

  slot.isActive = false;
  await slot.save();

  res.json({ message: "Slot removed" });
});

export { getSlots, createSlot, deleteSlot };
