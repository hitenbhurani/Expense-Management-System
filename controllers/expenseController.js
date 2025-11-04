const expenseModel = require("../models/expenseModel");

// Get all expenses for a user
const getAllExpensesController = async (req, res) => {
  try {
    const expenses = await expenseModel
      .find({ user: req.body.userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      expenses,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Add new expense
const addExpenseController = async (req, res) => {
  try {
    const { title, description, amount, category, date, type, userId } = req.body;
    
    const newExpense = new expenseModel({
      user: userId,
      title,
      description,
      amount,
      category,
      date,
      type,
    });
    
    await newExpense.save();
    
    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update expense
const updateExpenseController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, amount, category, date, type } = req.body;
    
    const updatedExpense = await expenseModel.findByIdAndUpdate(
      id,
      { title, description, amount, category, date, type },
      { new: true }
    );
    
    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete expense
const deleteExpenseController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedExpense = await expenseModel.findByIdAndDelete(id);
    
    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get expense statistics
const getExpenseStatsController = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const expenses = await expenseModel.find({ user: userId });
    
    const totalIncome = expenses
      .filter(expense => expense.type === 'income')
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const totalExpense = expenses
      .filter(expense => expense.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Category-wise expenses
    const categoryStats = {};
    expenses
      .filter(expense => expense.type === 'expense')
      .forEach(expense => {
        categoryStats[expense.category] = (categoryStats[expense.category] || 0) + expense.amount;
      });
    
    res.status(200).json({
      success: true,
      stats: {
        totalIncome,
        totalExpense,
        balance,
        categoryStats,
        totalTransactions: expenses.length,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllExpensesController,
  addExpenseController,
  updateExpenseController,
  deleteExpenseController,
  getExpenseStatsController,
};
