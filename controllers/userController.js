const AWS = require('aws-sdk');
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');

const { TABLE_NAME: MODEL_USER_TABLE } = require('../models/userModel');

// Configure AWS DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});
const rawDynamo = new AWS.DynamoDB({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});
// Allow table name to be set by environment, otherwise use model's TABLE_NAME, fall back to legacy name
const USER_TABLE = process.env.USER_TABLE || MODEL_USER_TABLE || 'portfolio-users';

console.log('Using DynamoDB user table:', USER_TABLE);

// Ensure the users table exists with correct key schema; create if missing then wait until active
async function ensureUserTableExists() {
  try {
    await rawDynamo.describeTable({ TableName: USER_TABLE }).promise();
    return true;
  } catch (err) {
    if (err && err.code === 'ResourceNotFoundException') {
      console.log(`User table ${USER_TABLE} not found. Creating...`);
      const params = {
        TableName: USER_TABLE,
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' }
        ],
        // Remove GSI since we can't query it with restricted permissions
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      };
      try {
        await rawDynamo.createTable(params).promise();
        await rawDynamo.waitFor('tableExists', { TableName: USER_TABLE }).promise();
        console.log(`User table ${USER_TABLE} created.`);
        return true;
      } catch (createErr) {
        console.error('Failed to create user table:', createErr);
        throw createErr;
      }
    }
    throw err;
  }
}

// login callback
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password"
      });
    }

    console.log('Attempting login for email:', email);
    
    // Use direct get operation with email as key to avoid Query/Scan restrictions
    const getParams = {
      TableName: USER_TABLE,
      Key: {
        userId: email // Use email as userId for direct get operations
      }
    };

    console.log('Getting user from DynamoDB with params:', JSON.stringify(getParams, null, 2));
    
    let result;
    try {
      result = await dynamodb.get(getParams).promise();
    } catch (err) {
      console.error('Get operation failed:', err && err.message ? err.message : err);
      return res.status(500).json({
        success: false,
        message: "Database access error"
      });
    }
    
    console.log('Get result:', JSON.stringify(result, null, 2));
    
    const user = result.Item;

    if (!user) {
      console.log('No user found with email:', email);
      // Use a generic message for security
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log('User found, verifying password');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password verification failed');
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log('Password verified successfully');
    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    // Check for specific AWS errors
    if (error.code === 'ResourceNotFoundException') {
      return res.status(500).json({
        success: false,
        message: "Database table not found"
      });
    } else if (error.code === 'ValidationException') {
      return res.status(500).json({
        success: false,
        message: "Database validation error"
      });
    } else if (error.code === 'ExpiredTokenException') {
      return res.status(500).json({
        success: false,
        message: "AWS credentials have expired"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "An error occurred during login"
    });
  }
};

// Register Callback
const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    console.log('Checking if email exists:', email);
    
    // Ensure table exists (auto-create on first run)
    await ensureUserTableExists();

    // Ensure table exists (auto-create on first run)
    await ensureUserTableExists();

    // Check if user exists using direct get operation (instead of query/scan)
    const existingUserParams = {
      TableName: USER_TABLE,
      Key: {
        userId: email // Use email as userId for direct access
      }
    };
    
    console.log('Checking for existing user with params:', JSON.stringify(existingUserParams, null, 2));
    let existingResult;
    try {
      existingResult = await dynamodb.get(existingUserParams).promise();
    } catch (err) {
      console.error('Get operation failed during registration check:', err && err.message ? err.message : err);
      return res.status(500).json({
        success: false,
        message: "Database access error during registration check"
      });
    }
    
    if (existingResult.Item) {
      console.log('Email already exists');
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    console.log('Creating new user');
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user - use email as userId for direct access
    const newUser = {
      userId: email, // Use email as primary key
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    const putParams = {
      TableName: USER_TABLE,
      Item: newUser,
      ConditionExpression: 'attribute_not_exists(userId)', // Prevent overwriting
      ReturnValues: 'NONE'
    };

    console.log('Attempting to put user in DynamoDB with params:', JSON.stringify(putParams, null, 2));
    try {
      await dynamodb.put(putParams).promise();
      console.log('User created successfully in table:', USER_TABLE);
    } catch (putError) {
      if (putError && putError.code === 'ResourceNotFoundException') {
        // If table just created or missing, ensure and retry once
        await ensureUserTableExists();
        await dynamodb.put(putParams).promise();
        console.log('User created successfully after ensuring table.');
      } else {
        console.error('Error putting user in DynamoDB:', putError);
        throw putError;
      }
    }

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific AWS errors
    if (error.code === 'ConditionalCheckFailedException') {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    } else if (error.code === 'ResourceNotFoundException') {
      return res.status(500).json({
        success: false,
        message: "Table not found: " + USER_TABLE
      });
    } else if (error.code === 'ValidationException') {
      return res.status(400).json({
        success: false,
        message: "Invalid input data: " + error.message
      });
    } else if (error.code === 'ExpiredTokenException') {
      return res.status(500).json({
        success: false,
        message: "AWS credentials have expired. Please refresh your session."
      });
    } else if (error.code === 'AccessDeniedException') {
      return res.status(500).json({
        success: false,
        message: "Access denied to DynamoDB. Check your AWS permissions."
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Registration failed: " + error.message
    });
  }
};

module.exports = { loginController, registerController };
