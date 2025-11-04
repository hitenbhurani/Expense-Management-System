const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { TABLES, dynamoDbHelper } = require('../config/dynamoDb');

// Get all assets for a user
const getAllAssetsController = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('📊 getAllAssets called with userId:', userId);
    
    if (!userId) {
      throw new Error('userId is required');
    }
    
    // Get user's assets list from their profile
    const userAssets = await dynamoDbHelper.get(TABLES.USERS, { userId });
    const assetIds = (userAssets && userAssets.assetIds) ? userAssets.assetIds : [];
    
    // Get each asset individually due to AWS restrictions
    const assets = [];
    for (const assetId of assetIds) {
      try {
        const asset = await dynamoDbHelper.get(TABLES.ASSETS, { userId, assetId });
        if (asset) {
          assets.push(asset);
        }
      } catch (err) {
        console.warn(`Could not fetch asset ${assetId}:`, err.message);
      }
    }
    
    res.status(200).json({
      success: true,
      assets: assets
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Add new asset
const addAssetController = async (req, res) => {
  try {
    const { 
      assetName, 
      assetType, 
      description, 
      quantity, 
      purchasePrice, 
      currentPrice, 
      purchaseDate, 
      status,
      tags,
      notes,
      userId 
    } = req.body;
    
    // Validate required fields
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!assetName) {
      throw new Error('assetName is required');
    }
    if (!assetType) {
      throw new Error('assetType is required');
    }
    
    const qty = Number(quantity);
    const pur = Number(purchasePrice);
    const cur = Number(currentPrice);

    const newAsset = {
      assetId: uuidv4(),
      userId,
      assetName,
      assetType,
      description: description || '',
      quantity: Number.isFinite(qty) ? qty : 0,
      purchasePrice: Number.isFinite(pur) ? pur : 0,
      currentPrice: Number.isFinite(cur) ? cur : 0,
      purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : new Date().toISOString(),
      status: status || "Active",
      tags: tags || [],
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Attempting to save asset:', JSON.stringify(newAsset, null, 2));
    await dynamoDbHelper.put(TABLES.ASSETS, newAsset);
    
    // Update user's asset list
    try {
      const user = await dynamoDbHelper.get(TABLES.USERS, { userId });
      if (user) {
        const currentAssetIds = user.assetIds || [];
        if (!currentAssetIds.includes(newAsset.assetId)) {
          const updatedUser = {
            ...user,
            assetIds: [...currentAssetIds, newAsset.assetId]
          };
          await dynamoDbHelper.put(TABLES.USERS, updatedUser);
        }
      }
    } catch (userUpdateError) {
      console.warn('Failed to update user asset list:', userUpdateError.message);
      // Continue anyway - asset was saved
    }
    
    res.status(201).json({
      success: true,
      message: "Asset added successfully",
      asset: newAsset
    });
  } catch (error) {
    console.error('Add asset error:', error);
    const message = (error && error.message) ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      error: message
    });
  }
};

// Update asset
const updateAssetController = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ...updateData } = req.body;
    
    // First check if asset exists
    const existingAsset = await dynamoDbHelper.get(TABLES.ASSETS, { userId, assetId: id });
    
    if (!existingAsset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }
    
    const updatedAsset = {
      ...existingAsset,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await dynamoDbHelper.put(TABLES.ASSETS, updatedAsset);
    
    res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      asset: updatedAsset
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete asset
const deleteAssetController = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    await dynamoDbHelper.delete(TABLES.ASSETS, { userId, assetId: id });
    
    res.status(200).json({
      success: true,
      message: "Asset deleted successfully"
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get portfolio analytics
const getPortfolioAnalyticsController = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('📈 getPortfolioAnalytics called with userId:', userId);
    
    if (!userId) {
      throw new Error('userId is required');
    }
    
    // Get all assets for the user (using same pattern as getAllAssets)
    const userAssets = await dynamoDbHelper.get(TABLES.USERS, { userId });
    const assetIds = (userAssets && userAssets.assetIds) ? userAssets.assetIds : [];
    
    const assets = [];
    for (const assetId of assetIds) {
      try {
        const asset = await dynamoDbHelper.get(TABLES.ASSETS, { userId, assetId });
        if (asset) {
          assets.push(asset);
        }
      } catch (err) {
        console.warn(`Could not fetch asset ${assetId}:`, err.message);
      }
    }
    
    // Calculate analytics
    let totalValue = 0;
    let totalInvestment = 0;
    let totalProfitLoss = 0;
    
    const enrichedAssets = assets.map(asset => {
      const qty = Number(asset.quantity || 0);
      const purchase = Number(asset.purchasePrice || 0);
      const current = Number(asset.currentPrice || 0);
      
      const investment = qty * purchase;
      const value = qty * current;
      const profitLoss = value - investment;
      
      totalInvestment += investment;
      totalValue += value;
      totalProfitLoss += profitLoss;
      
      return {
        ...asset,
        investment,
        totalValue: value,
        profitLoss,
        profitLossPercentage: investment > 0 ? (profitLoss / investment) * 100 : 0
      };
    });
    
    const returnPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
    
    // Get top and worst performers
    const topPerformers = enrichedAssets
      .filter(a => a.profitLoss > 0)
      .sort((a, b) => b.profitLoss - a.profitLoss)
      .slice(0, 5);
      
    const worstPerformers = enrichedAssets
      .filter(a => a.profitLoss < 0)
      .sort((a, b) => a.profitLoss - b.profitLoss)
      .slice(0, 5);
    
    const analytics = {
      overview: {
        totalValue,
        totalCurrentValue: totalValue, // Frontend expects this property
        totalInvestment,
        totalProfitLoss,
        returnPercentage,
        assetsCount: assets.length
      },
      topPerformers,
      worstPerformers,
      monthlyPerformance: [] // Frontend expects this array
    };
    
    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get portfolio analytics error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAllAssetsController,
  addAssetController,
  updateAssetController,
  deleteAssetController,
  getPortfolioAnalyticsController
};