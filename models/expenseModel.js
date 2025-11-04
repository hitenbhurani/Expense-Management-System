// DynamoDB Expense Model
const EXPENSE_CATEGORIES = [
  "Food", "Transportation", "Entertainment", "Shopping", 
  "Bills", "Healthcare", "Education", "Other"
];

const TRANSACTION_TYPES = ["income", "expense"];

// Validation functions
const validateExpense = (expense) => {
  const errors = [];
  
  if (!expense.userId) errors.push("userId is required");
  if (!expense.title) errors.push("title is required");
  if (!expense.description) errors.push("description is required");
  if (typeof expense.amount !== 'number' || expense.amount < 0) {
    errors.push("amount must be a non-negative number");
  }
  if (!expense.category || !EXPENSE_CATEGORIES.includes(expense.category)) {
    errors.push(`category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`);
  }
  if (!expense.date) errors.push("date is required");
  if (!expense.type || !TRANSACTION_TYPES.includes(expense.type)) {
    errors.push(`type must be one of: ${TRANSACTION_TYPES.join(', ')}`);
  }
  
  return errors;
};

// Process expense before saving
const processExpense = (expense) => {
  return {
    ...expense,
    expenseId: expense.expenseId || uuidv4(),
    date: expense.date || new Date().toISOString(),
    createdAt: expense.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

module.exports = {
  TABLE_NAME: process.env.EXPENSE_TABLE || 'portfolio-transactions',
  EXPENSE_CATEGORIES,
  TRANSACTION_TYPES,
  validateExpense,
  processExpense
};
