require('dotenv').config();
const AWS = require('aws-sdk');

// AWS Configuration
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN // Important for AWS Academy
});

const dynamodb = new AWS.DynamoDB();

// Test function to list all tables
async function listTables() {
  try {
    const data = await dynamodb.listTables().promise();
    console.log('Connection successful!');
    console.log('Available tables:', data.TableNames);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

// Run test
console.log('Testing DynamoDB connection...');
listTables();