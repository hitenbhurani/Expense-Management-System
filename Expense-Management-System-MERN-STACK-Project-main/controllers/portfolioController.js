const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { TABLES, dynamoDbHelper } = require('../config/dynamoDb');

// Get all assets for a user
const getAllAssetsController = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const params = {
      TableName: TABLES.ASSETS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    
    const result = await dynamoDbHelper.query(TABLES.ASSETS, 'userId = :userId', { ':userId': userId });
    
    res.status(200).json({
      success: true,
      assets: result
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
    
    const newAsset = {
      assetId: uuidv4(),
      userId,
      assetName,
      assetType,
      description: description || '',
      quantity: parseFloat(quantity || '0'),
      purchasePrice: parseFloat(purchasePrice || '0'),
      currentPrice: parseFloat(currentPrice || '0'),
      purchaseDate: purchaseDate || new Date().toISOString(),
      status: status || "Active",
      tags: tags || [],
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Attempting to save asset:', JSON.stringify(newAsset, null, 2));
    await dynamoDbHelper.put(TABLES.ASSETS, newAsset);
    
    res.status(201).json({
      success: true,
      message: "Asset added successfully",
      asset: newAsset
    });
  } catch (error) {
    console.error('Add asset error:', error);
    res.status(400).json({
      success: false,
      error: error.message
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

module.exports = {
  getAllAssetsController,
  addAssetController,
  updateAssetController,
  deleteAssetController
};