require('dotenv').config();
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function demonstrateFlow() {
  try {
    console.log('🚀 Starting DynamoDB Demonstration\n');

    // 1. Create a test user
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = {
      userId,
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword
    };

    console.log('Step 1: Creating a new user');
    await dynamodb.put({
      TableName: 'portfolio-users',
      Item: user
    }).promise();
    console.log('✅ User created successfully\n');

    // 2. Add an asset
    const assetId = uuidv4();
    const asset = {
      userId,
      assetId,
      name: 'Demo Stock',
      category: 'Stocks',
      purchasePrice: 1000,
      currentValue: 1200,
      purchaseDate: new Date().toISOString(),
      notes: 'Demo asset for interview'
    };

    console.log('Step 2: Adding a new asset');
    await dynamodb.put({
      TableName: 'portfolio-assets',
      Item: asset
    }).promise();
    console.log('✅ Asset added successfully\n');

    // 3. Retrieve and show the asset
    console.log('Step 3: Retrieving the asset');
    const result = await dynamodb.get({
      TableName: 'portfolio-assets',
      Key: {
        userId,
        assetId
      }
    }).promise();
    console.log('Retrieved asset:', result.Item, '\n');

    // 4. Update the asset
    console.log('Step 4: Updating the asset');
    await dynamodb.update({
      TableName: 'portfolio-assets',
      Key: {
        userId,
        assetId
      },
      UpdateExpression: 'set currentValue = :value, notes = :notes',
      ExpressionAttributeValues: {
        ':value': 1500,
        ':notes': 'Updated during demo'
      }
    }).promise();
    console.log('✅ Asset updated successfully\n');

    // 5. Show all assets for the user
    console.log('Step 5: Listing all assets for the user');
    const userAssets = await dynamodb.query({
      TableName: 'portfolio-assets',
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: {
        ':uid': userId
      }
    }).promise();
    console.log('User assets:', userAssets.Items, '\n');

    // 6. Show table statistics
    console.log('Step 6: Getting table statistics');
    const tables = ['portfolio-users', 'portfolio-assets', 'portfolio-transactions'];
    for (const tableName of tables) {
      const tableInfo = await new AWS.DynamoDB().describeTable({
        TableName: tableName
      }).promise();
      console.log(`${tableName}:`, {
        ItemCount: tableInfo.Table.ItemCount,
        TableStatus: tableInfo.Table.TableStatus
      });
    }

    console.log('\n🎉 Demonstration completed successfully!');
    console.log('\nNext steps for the interviewer:');
    console.log('1. Open AWS Academy Learner Lab');
    console.log('2. Navigate to DynamoDB service');
    console.log('3. Click on "Tables" in the left sidebar');
    console.log('4. Select "portfolio-assets" table');
    console.log('5. Click "Explore table items" to see the created/updated items');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ExpiredToken') {
      console.log('\n⚠️ Your AWS session token has expired. Please get new credentials from AWS Academy.');
    }
  }
}

// Run the demonstration
demonstrateFlow();