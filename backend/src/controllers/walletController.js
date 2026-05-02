import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";

// Helper to get or create wallet for user
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }
  return wallet;
};

// @desc    Get user wallet balance and transactions
// @route   GET /api/wallet
// @access  Private
const getWallet = asyncHandler(async (req, res) => {
  const wallet = await getOrCreateWallet(req.user._id);
  const transactions = await WalletTransaction.find({ walletId: wallet._id })
    .sort("-createdAt")
    .limit(20);

  res.json({
    balance: wallet.balance,
    transactions,
  });
});

// @desc    Add cashback to wallet (Internal use or specific bulk order route)
// @route   POST /api/wallet/cashback
// @access  Private
const processCashback = asyncHandler(async (req, res) => {
  const { orderId, amount, description } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await getOrCreateWallet(req.user._id);

    wallet.balance += Number(amount);
    await wallet.save({ session });

    const transaction = await WalletTransaction.create(
      [
        {
          walletId: wallet._id,
          type: "credit",
          amount: Number(amount),
          description: description || "Cashback for bulk order",
          referenceId: orderId,
          referenceModel: "Order",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(200).json({ message: "Cashback applied successfully", balance: wallet.balance });
  } catch (error) {
    await session.abortTransaction();
    res.status(500);
    throw new Error("Failed to process cashback");
  } finally {
    session.endSession();
  }
});

export { getWallet, processCashback, getOrCreateWallet };
