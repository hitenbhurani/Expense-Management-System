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

async function createEmailIndex() {
  try {
    const params = {
      TableName: 'portfolio-users',
      AttributeDefinitions: [
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

    console.log('Creating email index...');
    await dynamodb.updateTable(params).promise();
    console.log('✅ Email index created successfully');

    // Wait for the index to become active
    while (true) {
      const table = await dynamodb.describeTable({ TableName: 'portfolio-users' }).promise();
      const index = table.Table.GlobalSecondaryIndexes?.find(idx => idx.IndexName === 'email-index');
      
      if (index?.IndexStatus === 'ACTIVE') {
        console.log('✅ Index is now active and ready to use');
        break;
      }
      
      console.log('Waiting for index to become active...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
    }

  } catch (error) {
    if (error.code === 'ValidationException' && error.message.includes('already exists')) {
      console.log('ℹ️ Email index already exists');
    } else {
      console.error('❌ Error:', error);
    }
  }
}

createEmailIndex().then(() => {
  console.log('🎉 Setup completed');
}).catch(err => {
  console.error('Setup failed:', err);
});