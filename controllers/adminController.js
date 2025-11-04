const userModel = require("../models/userModel");
const assetModel = require("../models/assetModel");

// Get all users for admin
const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get user by ID
const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update user role or status
const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;
    
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { role, isActive },
      { new: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete user
const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Also delete user's assets
    await assetModel.deleteMany({ user: id });
    
    const deletedUser = await userModel.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get system analytics
const getSystemAnalyticsController = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const activeUsers = await userModel.countDocuments({ isActive: true });
    const adminUsers = await userModel.countDocuments({ role: "admin" });
    const regularUsers = await userModel.countDocuments({ role: "user" });
    
    const totalAssets = await assetModel.countDocuments();
    const activeAssets = await assetModel.countDocuments({ status: "Active" });
    
    // Asset type distribution
    const assetTypeStats = await assetModel.aggregate([
      { $group: { _id: "$assetType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // User registration over time (last 12 months)
    const userRegistrationStats = await userModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Asset creation over time
    const assetCreationStats = await assetModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Top users by asset count
    const topUsersByAssets = await assetModel.aggregate([
      { $group: { _id: "$user", assetCount: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { "user.name": 1, "user.email": 1, assetCount: 1 } },
      { $sort: { assetCount: -1 } },
      { $limit: 10 }
    ]);
    
    // Recent activities
    const recentUsers = await userModel.find({})
      .select("name email createdAt lastLogin")
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentAssets = await assetModel.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          activeUsers,
          adminUsers,
          regularUsers,
          totalAssets,
          activeAssets,
        },
        assetTypeStats,
        userRegistrationStats,
        assetCreationStats,
        topUsersByAssets,
        recentUsers,
        recentAssets,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all assets for admin
const getAllAssetsController = async (req, res) => {
  try {
    const assets = await assetModel.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      assets,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get user's assets for admin
const getUserAssetsController = async (req, res) => {
  try {
    const { id } = req.params;
    const assets = await assetModel.find({ user: id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      assets,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  getSystemAnalyticsController,
  getAllAssetsController,
  getUserAssetsController,
};
