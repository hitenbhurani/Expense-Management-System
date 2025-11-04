const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const dynamodb = new AWS.DynamoDB();

// Table definitions
const tables = [
  {
    TableName: 'portfolio-users',
    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
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
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
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
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
  }
];

// Create tables
async function createTables() {
  for (const tableDefinition of tables) {
    try {
      console.log(`Creating table: ${tableDefinition.TableName}`);
      await dynamodb.createTable(tableDefinition).promise();
      console.log(`✅ Table ${tableDefinition.TableName} created successfully`);
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        console.log(`ℹ️ Table ${tableDefinition.TableName} already exists`);
      } else {
        console.error(`❌ Error creating table ${tableDefinition.TableName}:`, error.message);
      }
    }
  }
}

// Run the setup
createTables().then(() => {
  console.log('🎉 DynamoDB setup complete!');
}).catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});