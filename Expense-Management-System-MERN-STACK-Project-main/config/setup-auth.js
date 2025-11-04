require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const dynamodb = new AWS.DynamoDB();

// Update portfolio-users table to add email GSI
async function createEmailIndex() {
  try {
    console.log('Creating email index on portfolio-users table...');
    
    const params = {
      TableName: 'portfolio-users',
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: 'email-index',
            KeySchema: [
              { AttributeName: 'email', KeyType: 'HASH' }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
            }
          }
        }
      ]
    };

    await dynamodb.updateTable(params).promise();
    console.log('✅ Email index created successfully');
    
    // Wait for the index to be active
    console.log('Waiting for index to become active...');
    await waitForIndexToBeActive('portfolio-users', 'email-index');
    console.log('✅ Email index is now active');
    
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('Index already exists, proceeding...');
    } else {
      console.error('Error creating index:', error);
      throw error;
    }
  }
}

async function waitForIndexToBeActive(tableName, indexName) {
  let indexStatus = '';
  do {
    const table = await dynamodb.describeTable({ TableName: tableName }).promise();
    const index = table.Table.GlobalSecondaryIndexes.find(idx => idx.IndexName === indexName);
    indexStatus = index.IndexStatus;
    if (indexStatus !== 'ACTIVE') {
      console.log(`Index status: ${indexStatus}, waiting...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
  } while (indexStatus !== 'ACTIVE');
}

// Create test user for verification
async function createTestUser() {
  const docClient = new AWS.DynamoDB.DocumentClient();
  const bcrypt = require('bcryptjs');
  
  try {
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = {
      userId: 'test-' + Date.now(),
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    await docClient.put({
      TableName: 'portfolio-users',
      Item: testUser
    }).promise();

    console.log('✅ Test user created successfully');
    console.log('Test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: test123');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Run setup
async function setup() {
  try {
    await createEmailIndex();
    await createTestUser();
    console.log('🎉 Setup completed successfully!');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup();