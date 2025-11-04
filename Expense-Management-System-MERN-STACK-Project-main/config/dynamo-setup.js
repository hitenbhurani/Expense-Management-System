require('dotenv').config();
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

const tables = [
  {
    TableName: 'portfolio-users',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
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

async function deleteTableIfExists(tableName) {
  try {
    console.log(`Checking if table ${tableName} exists...`);
    await dynamodb.describeTable({ TableName: tableName }).promise();
    console.log(`Deleting existing table ${tableName}...`);
    await dynamodb.deleteTable({ TableName: tableName }).promise();
    console.log(`Waiting for table ${tableName} to be deleted...`);
    await dynamodb.waitFor('tableNotExists', { TableName: tableName }).promise();
  } catch (error) {
    if (error.code !== 'ResourceNotFoundException') {
      throw error;
    }
  }
}

async function createTable(tableDefinition) {
  try {
    await deleteTableIfExists(tableDefinition.TableName);
    console.log(`Creating table ${tableDefinition.TableName}...`);
    await dynamodb.createTable(tableDefinition).promise();
    console.log(`Waiting for table ${tableDefinition.TableName} to be active...`);
    await dynamodb.waitFor('tableExists', { TableName: tableDefinition.TableName }).promise();
    console.log(`✅ Table ${tableDefinition.TableName} created successfully`);
  } catch (error) {
    console.error(`Error creating table ${tableDefinition.TableName}:`, error);
    throw error;
  }
}

async function createTestUser() {
  const hashedPassword = await bcrypt.hash('test123', 10);
  const testUser = {
    userId: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  try {
    console.log('Creating test user...');
    await docClient.put({
      TableName: 'portfolio-users',
      Item: testUser,
      ConditionExpression: 'attribute_not_exists(email)'
    }).promise();
    console.log('✅ Test user created successfully');
    console.log('Test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: test123');
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      console.log('Test user already exists');
    } else {
      throw error;
    }
  }
}

async function verifyTables() {
  for (const table of tables) {
    try {
      const result = await dynamodb.describeTable({ TableName: table.TableName }).promise();
      console.log(`Table ${table.TableName} status:`, result.Table.TableStatus);
      
      if (table.TableName === 'portfolio-users') {
        const count = await docClient.scan({
          TableName: table.TableName,
          Select: 'COUNT'
        }).promise();
        console.log(`Number of users: ${count.Count}`);
      }
    } catch (error) {
      console.error(`Error verifying table ${table.TableName}:`, error);
    }
  }
}

async function setup() {
  try {
    console.log('🚀 Starting DynamoDB setup...\n');

    // Create tables sequentially to ensure proper creation
    for (const table of tables) {
      await createTable(table);
      console.log(`Waiting for table ${table.TableName} to be fully ready...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Create test user
    await createTestUser();
    
    // Verify setup
    console.log('\nVerifying table setup:');
    await verifyTables();
    
    console.log('\n✨ Setup completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Start your application');
    console.log('2. Register a new user');
    console.log('3. Or login with test account:');
    console.log('   Email: test@example.com');
    console.log('   Password: test123');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setup();