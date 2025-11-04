/**
 * Lightweight connectivity check script for DynamoDB tables used by the app.
 * Run: node scripts/verify-dynamo-connection.js
 * It will list tables and describe the three tables the app expects.
 * This script is read-only and safe to run.
 */
require('dotenv').config();
const AWS = require('aws-sdk');

const region = process.env.AWS_REGION || process.env.aws_region || 'us-east-1';
AWS.config.update({
  region,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.aws_access_key_id,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.aws_secret_access_key,
  sessionToken: process.env.AWS_SESSION_TOKEN || process.env.aws_session_token
});

const ddb = new AWS.DynamoDB();
const doc = new AWS.DynamoDB.DocumentClient();

const expectedTables = ['portfolio-users', 'portfolio-assets', 'portfolio-transactions'];

async function describe(name) {
  try {
    const table = await ddb.describeTable({ TableName: name }).promise();
    console.log(`\nTable: ${name}`);
    console.log('  TableStatus:', table.Table.TableStatus);
    console.log('  ItemCount:', table.Table.ItemCount);
    console.log('  KeySchema:', JSON.stringify(table.Table.KeySchema));
    return true;
  } catch (err) {
    console.error(`\nTable: ${name} - ERROR:`, err && err.code ? `${err.code} - ${err.message}` : err);
    return false;
  }
}

async function quickScanCount(name) {
  try {
    const res = await doc.scan({ TableName: name, Limit: 1 }).promise();
    console.log(`  Scan returned ${res.Count} item(s) (limited to 1).`);
  } catch (err) {
    console.error(`  Scan error: ${err && err.code ? `${err.code} - ${err.message}` : err}`);
  }
}

async function main() {
  console.log('Using AWS region:', region);
  try {
    const list = await ddb.listTables().promise();
    console.log('\nDynamoDB tables found (first 200):', (list.TableNames || []).slice(0,200).join(', ') || '(none)');
  } catch (err) {
    console.error('Failed to list tables:', err && err.code ? `${err.code} - ${err.message}` : err);
    process.exit(1);
  }

  for (const t of expectedTables) {
    const ok = await describe(t);
    if (ok) await quickScanCount(t);
  }

  console.log('\nDone. If any table shows an ERROR, check your AWS credentials, region, and that the table exists in the same account.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
