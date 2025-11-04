const AWS = require('aws-sdk');
const colors = require("colors");

const connectDb = async () => {
  try {
    // Configure AWS
    AWS.config.update({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN
    });

    // Create DynamoDB instance
    const dynamodb = new AWS.DynamoDB();

    // Test connection by listing tables
    await dynamodb.listTables().promise();
    console.log("DynamoDB connected successfully".bgCyan.white);
    
    return true;
  } catch (error) {
    if (error.code === 'ExpiredToken') {
      console.error("AWS credentials have expired. Please get new credentials.".bgRed);
    } else {
      console.error("DynamoDB connection error:", error.message.bgRed);
    }
    return false;
  }
};

module.exports = connectDb;
