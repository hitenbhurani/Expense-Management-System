const AWS = require('aws-sdk');
require('dotenv').config();

// AWS Configuration
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();

// Table definitions
const tables = [
  {
    TableName: 'portfolio-users',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: 'portfolio-assets',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'assetId', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'assetId', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: 'portfolio-transactions',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'transactionId', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'transactionId', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
];

// Create tables
async function createTables() {
  for (const tableParams of tables) {
    try {
      console.log(`Creating table: ${tableParams.TableName}`);
      await dynamodb.createTable(tableParams).promise();
      console.log(`Table ${tableParams.TableName} created successfully`);
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        console.log(`Table ${tableParams.TableName} already exists`);
      } else {
        console.error(`Error creating table ${tableParams.TableName}:`, error);
      }
    }
  }
}

createTables()
  .then(() => console.log('Tables setup completed'))
  .catch(err => console.error('Setup failed:', err));