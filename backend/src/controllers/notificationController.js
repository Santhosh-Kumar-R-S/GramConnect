import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort("-createdAt");
  res.json(notifications);
});

const markNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { read: true });
  res.json({ message: "All notifications marked as read" });
});

export { getNotifications, markNotificationsRead };
