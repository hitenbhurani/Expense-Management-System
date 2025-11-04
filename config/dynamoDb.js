const AWS = require('aws-sdk');

// Support DynamoDB Local for development without IAM access
const useLocal = String(process.env.USE_LOCAL_DYNAMO || '').toLowerCase() === 'true';
const localEndpoint = process.env.DYNAMO_ENDPOINT || 'http://127.0.0.1:8000';

if (useLocal) {
  // Point SDK to local endpoint with dummy credentials
  AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
    sessionToken: process.env.AWS_SESSION_TOKEN,
  });
} else {
  // Standard AWS config
  AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  });
}

// Create DynamoDB client (with optional local endpoint)
const dynamoDb = new AWS.DynamoDB.DocumentClient(
  useLocal ? { endpoint: localEndpoint } : {}
);

// Table names
const TABLES = {
  USERS: 'portfolio-users',
  ASSETS: 'portfolio-assets',
  EXPENSES: 'portfolio-transactions'
};

// Helper functions for common DynamoDB operations
const dynamoDbHelper = {
  // Create or update item
  async put(tableName, item) {
    const params = {
      TableName: tableName,
      Item: item
    };
    return dynamoDb.put(params).promise();
  },

  // Get single item by key
  async get(tableName, key) {
    const params = {
      TableName: tableName,
      Key: key
    };
    const result = await dynamoDb.get(params).promise();
    return result.Item;
  },

  // Query items
  async query(tableName, keyConditionExpression, expressionAttributeValues) {
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues
    };
    const result = await dynamoDb.query(params).promise();
    return result.Items;
  },

  // Scan entire table
  async scan(tableName) {
    const params = {
      TableName: tableName
    };
    const result = await dynamoDb.scan(params).promise();
    return result.Items;
  },

  // Delete item
  async delete(tableName, key) {
    const params = {
      TableName: tableName,
      Key: key
    };
    return dynamoDb.delete(params).promise();
  },

  // Update item
  async update(tableName, key, updateExpression, expressionAttributeValues) {
    const params = {
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    const result = await dynamoDb.update(params).promise();
    return result.Attributes;
  }
};

module.exports = {
  dynamoDb,
  TABLES,
  dynamoDbHelper
};