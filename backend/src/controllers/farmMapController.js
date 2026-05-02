import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Farmer from "../models/Farmer.js";
import { getFreshnessScore } from "../utils/freshnessScore.js";

// @desc    Get farmers near a location
// @route   GET /api/farms/nearby?lat=&lng=&radius=50&category=
// @access  Public
const getNearbyFarms = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 50, category } = req.query;

  if (!lat || !lng) {
    res.status(400);
    throw new Error("lat and lng are required");
  }

  const farmers = await User.find({
    role: "farmer",
    status: "approved",
    "geoCoordinates.coordinates": { $exists: true },
    geoCoordinates: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseFloat(radius) * 1000  // km → metres
      }
    }
  })
    .select("name village location geoCoordinates crops")
    .limit(60);

  // For each farmer, fetch product count (optionally filtered by category)
  const farmerIds = farmers.map(f => f._id);
  const productFilter = { farmer: { $in: farmerIds }, quantity: { $gt: 0 } };
  if (category) productFilter.category = category;

  const productCounts = await Product.aggregate([
    { $match: productFilter },
    { $group: { _id: "$farmer", count: { $sum: 1 }, categories: { $addToSet: "$category" } } }
  ]);

  const countMap = {};
  productCounts.forEach(p => { countMap[p._id.toString()] = p; });

  const result = farmers.map(f => {
    const info = countMap[f._id.toString()] || { count: 0, categories: [] };
    return {
      _id: f._id,
      name: f.name,
      village: f.village,
      location: f.location,
      coordinates: f.geoCoordinates?.coordinates,
      crops: f.crops,
      productCount: info.count,
      categories: info.categories
    };
  }).filter(f => (category ? f.productCount > 0 : true));

  res.json(result);
});

// @desc    Get full farmer profile (products, rating, story)
// @route   GET /api/farms/:farmerId/profile
// @access  Public
const getFarmerProfile = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;

  const user = await User.findById(farmerId)
    .select("name village location geoCoordinates crops pincode createdAt");

  if (!user || user.role !== "farmer") {
    res.status(404);
    throw new Error("Farmer not found");
  }

  const farmerProfile = await Farmer.findOne({ user: farmerId });

  const products = await Product.find({ farmer: farmerId, quantity: { $gt: 0 } })
    .sort("-createdAt")
    .limit(20);

  const productsWithFreshness = products.map(p => {
    const obj = p.toObject();
    obj.freshness = getFreshnessScore(obj.harvestDate, obj.category);
    return obj;
  });

  res.json({
    _id: user._id,
    name: user.name,
    village: user.village,
    location: user.location,
    pincode: user.pincode,
    geoCoordinates: user.geoCoordinates,
    crops: user.crops,
    memberSince: user.createdAt,
    story: farmerProfile?.story || "",
    farmImages: farmerProfile?.farmImages || [],
    experienceYears: farmerProfile?.experienceYears || 0,
    rating: farmerProfile?.rating || 0,
    numReviews: farmerProfile?.numReviews || 0,
    isOrganicVerified: farmerProfile?.isOrganicVerified || false,
    products: productsWithFreshness
  });
});

export { getNearbyFarms, getFarmerProfile };
