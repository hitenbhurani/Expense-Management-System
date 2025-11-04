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
// Allow table name to be set by environment, otherwise use model's TABLE_NAME, fall back to legacy name
const USER_TABLE = process.env.USER_TABLE || MODEL_USER_TABLE || 'portfolio-users';

console.log('Using DynamoDB user table:', USER_TABLE);

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
    
    // First try querying by email index
    const emailParams = {
      TableName: USER_TABLE,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };

    console.log('Querying DynamoDB with params:', JSON.stringify(emailParams, null, 2));
    
    let result;
    try {
      result = await dynamodb.query(emailParams).promise();
    } catch (err) {
      console.warn('Query by index failed, falling back to scan. Error:', err && err.message ? err.message : err);
      // Fallback: if index does not exist, scan the table (less efficient but works for dev)
      const scanParams = {
        TableName: USER_TABLE,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      };
      console.log('Scanning DynamoDB with params:', JSON.stringify(scanParams, null, 2));
      result = await dynamodb.scan(scanParams).promise();
    }
    console.log('Query result:', JSON.stringify(result, null, 2));
    
    const user = result.Items && result.Items[0];

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
    
    // Check if email exists
    const existingParams = {
      TableName: USER_TABLE,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };

    console.log('Querying for existing user:', JSON.stringify(existingParams, null, 2));
    let existing;
    try {
      existing = await dynamodb.query(existingParams).promise();
    } catch (err) {
      console.warn('Query by index failed during registration existing-check, falling back to scan. Error:', err && err.message ? err.message : err);
      const scanParams = {
        TableName: USER_TABLE,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      };
      console.log('Scanning DynamoDB for existing user with params:', JSON.stringify(scanParams, null, 2));
      existing = await dynamodb.scan(scanParams).promise();
    }
    
    if (existing.Items && existing.Items.length > 0) {
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

    // Create new user
    const userId = uuidv4();
    const newUser = {
      userId,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    const putParams = {
      TableName: USER_TABLE,
      Item: newUser,
      // Remove condition since email is not a primary key
      ReturnValues: 'NONE'
    };

    console.log('Attempting to put user in DynamoDB with params:', JSON.stringify(putParams, null, 2));
    try {
      await dynamodb.put(putParams).promise();
      console.log('User created successfully in table:', USER_TABLE);
    } catch (putError) {
      console.error('Error putting user in DynamoDB:', putError);
      throw putError;
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
