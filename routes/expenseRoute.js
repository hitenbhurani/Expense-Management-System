const express = require("express");
const {
  getAllExpensesController,
  addExpenseController,
  updateExpenseController,
  deleteExpenseController,
  getExpenseStatsController,
} = require("../controllers/expenseController");

//router object
const router = express.Router();

//routers
// GET || GET ALL EXPENSES
router.post("/get-all-expenses", getAllExpensesController);

// POST || ADD EXPENSE
router.post("/add-expense", addExpenseController);

// PUT || UPDATE EXPENSE
router.put("/update-expense/:id", updateExpenseController);

// DELETE || DELETE EXPENSE
router.delete("/delete-expense/:id", deleteExpenseController);

// POST || GET EXPENSE STATISTICS
router.post("/get-expense-stats", getExpenseStatsController);

module.exports = router;
