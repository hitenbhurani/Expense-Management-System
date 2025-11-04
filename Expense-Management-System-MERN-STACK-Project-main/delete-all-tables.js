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

async function deleteAllTables() {
  try {
    // List all tables
    const tables = await dynamodb.listTables({}).promise();
    console.log('Found tables:', tables.TableNames);

    // Delete each table
    for (const tableName of tables.TableNames) {
      console.log(`\nDeleting table ${tableName}...`);
      await dynamodb.deleteTable({ TableName: tableName }).promise();
      console.log(`Waiting for ${tableName} to be deleted...`);
      await dynamodb.waitFor('tableNotExists', { TableName: tableName }).promise();
      console.log(`✅ Table ${tableName} deleted successfully`);
    }

    console.log('\nAll tables deleted successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

deleteAllTables();