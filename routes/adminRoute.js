const express = require("express");
const {
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  getSystemAnalyticsController,
  getAllAssetsController,
  getUserAssetsController,
} = require("../controllers/adminController");

//router object
const router = express.Router();

//routers
// GET || GET ALL USERS
router.get("/users", getAllUsersController);

// GET || GET USER BY ID
router.get("/users/:id", getUserByIdController);

// PUT || UPDATE USER
router.put("/users/:id", updateUserController);

// DELETE || DELETE USER
router.delete("/users/:id", deleteUserController);

// GET || GET SYSTEM ANALYTICS
router.get("/analytics", getSystemAnalyticsController);

// GET || GET ALL ASSETS
router.get("/assets", getAllAssetsController);

// GET || GET USER'S ASSETS
router.get("/users/:id/assets", getUserAssetsController);

module.exports = router;
