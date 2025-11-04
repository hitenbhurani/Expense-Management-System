require('dotenv').config();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// AWS Configuration
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const testUserId = "test-user-1";

// Sample asset data
const sampleAssets = [
  {
    assetId: uuidv4(),
    userId: testUserId,
    assetName: "Apple Inc.",
    assetType: "Stocks",
    description: "Technology company stock",
    quantity: "10",
    purchasePrice: "150.50",
    currentPrice: "175.25",
    purchaseDate: "2023-01-15",
    status: "Active",
    tags: ["tech", "stocks"],
    notes: "Long-term investment",
    createdAt: new Date().toISOString()
  },
  {
    assetId: uuidv4(),
    userId: testUserId,
    assetName: "Bitcoin",
    assetType: "Cryptocurrency",
    description: "Digital currency investment",
    quantity: "0.5",
    purchasePrice: "30000",
    currentPrice: "35000",
    purchaseDate: "2023-02-20",
    status: "Active",
    tags: ["crypto", "digital"],
    notes: "High risk investment",
    createdAt: new Date().toISOString()
  }
];

// Insert sample data
async function insertSampleData() {
  try {
    console.log('Inserting sample data...');
    
    for (const asset of sampleAssets) {
      await dynamodb.put({
        TableName: 'portfolio-assets',
        Item: asset
      }).promise();
      console.log(`Inserted asset: ${asset.assetName}`);
    }
    
    console.log('Sample data inserted successfully!');
    
    // Verify by reading back
    const params = {
      TableName: 'portfolio-assets',
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': testUserId
      }
    };
    
    const result = await dynamodb.scan(params).promise();
    console.log('\nVerifying inserted data:');
    console.log(JSON.stringify(result.Items, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

insertSampleData();