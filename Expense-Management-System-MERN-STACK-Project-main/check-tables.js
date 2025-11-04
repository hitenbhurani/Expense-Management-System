require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const dynamodb = new AWS.DynamoDB();

async function checkTables() {
  try {
    const data = await dynamodb.listTables().promise();
    console.log('Tables:', data.TableNames);
    
    // Check each table's status
    for (const tableName of data.TableNames) {
      const tableData = await dynamodb.describeTable({ TableName: tableName }).promise();
      console.log(`\nTable: ${tableName}`);
      console.log('Status:', tableData.Table.TableStatus);
      console.log('Item count:', tableData.Table.ItemCount);
    }
  } catch (err) {
    console.error('Error:', err.message);
    if (err.code === 'ExpiredToken') {
      console.log('\nYour AWS session token has expired. Please get new credentials from AWS Academy.');
    }
  }
}

checkTables();