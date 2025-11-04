const express = require("express");
const {
  getAllAssetsController,
  addAssetController,
  updateAssetController,
  deleteAssetController,
  getPortfolioAnalyticsController,
} = require("../controllers/portfolioController");

//router object
const router = express.Router();

//routers
// GET || GET ALL ASSETS
router.post("/get-all-assets", getAllAssetsController);

// POST || ADD ASSET
router.post("/add-asset", addAssetController);

// PUT || UPDATE ASSET
router.put("/update-asset/:id", updateAssetController);

// DELETE || DELETE ASSET
router.delete("/delete-asset/:id", deleteAssetController);

// POST || GET PORTFOLIO ANALYTICS
router.post("/get-portfolio-analytics", getPortfolioAnalyticsController);

module.exports = router;
