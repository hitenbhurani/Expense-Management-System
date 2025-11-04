// DynamoDB Asset Model
const { calculateAssetMetrics } = require('../utils/assetCalculations');

const ASSET_TYPES = [
  "Stocks", "Bonds", "Real Estate", "Cryptocurrency", 
  "Commodities", "Mutual Funds", "ETFs", "Fixed Deposits", 
  "Gold", "Other"
];

const ASSET_STATUS = ["Active", "Sold", "Hold"];

// Validation functions
const validateAsset = (asset) => {
  const errors = [];
  
  if (!asset.userId) errors.push("userId is required");
  if (!asset.assetName) errors.push("assetName is required");
  if (!asset.assetType || !ASSET_TYPES.includes(asset.assetType)) {
    errors.push(`assetType must be one of: ${ASSET_TYPES.join(', ')}`);
  }
  if (!asset.description) errors.push("description is required");
  if (typeof asset.quantity !== 'number' || asset.quantity < 0) {
    errors.push("quantity must be a non-negative number");
  }
  if (typeof asset.purchasePrice !== 'number' || asset.purchasePrice < 0) {
    errors.push("purchasePrice must be a non-negative number");
  }
  if (typeof asset.currentPrice !== 'number' || asset.currentPrice < 0) {
    errors.push("currentPrice must be a non-negative number");
  }
  if (!asset.purchaseDate) errors.push("purchaseDate is required");
  if (asset.status && !ASSET_STATUS.includes(asset.status)) {
    errors.push(`status must be one of: ${ASSET_STATUS.join(', ')}`);
  }

  return errors;
};

// Process asset before saving
const processAsset = (asset) => {
  const metrics = calculateAssetMetrics(asset);
  return {
    ...asset,
    ...metrics,
    status: asset.status || "Active",
    lastUpdated: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

module.exports = {
  // Allow overriding table name via env for flexibility in different environments
  TABLE_NAME: process.env.ASSET_TABLE || 'portfolio-assets',
  ASSET_TYPES,
  ASSET_STATUS,
  validateAsset,
  processAsset
};
