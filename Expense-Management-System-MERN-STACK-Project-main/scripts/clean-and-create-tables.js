require('dotenv').config();
const AWS = require('aws-sdk');

// Safety: This script only deletes known legacy/asset/transaction tables and recreates the portfolio assets/transactions tables.
// By default it runs in dry-run mode. To actually perform deletes and creates set CONFIRM=true in the environment:
// CONFIRM=true node scripts/clean-and-create-tables.js

const region = process.env.AWS_REGION || 'us-east-1';
AWS.config.update({
  region,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const dynamodb = new AWS.DynamoDB();

const knownToDelete = [
  'expense-users',
  'expense-assets',
  'expense-transactions',
  'portfolio-assets',
  'portfolio-transactions'
];

const desiredCreates = [
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

async function listAndFilter() {
  const res = await dynamodb.listTables().promise();
  const tables = res.TableNames || [];
  const toDelete = tables.filter(t => knownToDelete.includes(t) && t !== 'portfolio-users');
  return { tables, toDelete };
}

async function deleteTable(name) {
  console.log(`Deleting table: ${name}`);
  await dynamodb.deleteTable({ TableName: name }).promise();
  // wait for deletion
  while (true) {
    try {
      await dynamodb.describeTable({ TableName: name }).promise();
      console.log(`Waiting for ${name} to be deleted...`);
      await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
      if (err.code === 'ResourceNotFoundException') {
        console.log(`Confirmed ${name} deleted`);
        break;
      }
      throw err;
    }
  }
}

async function createTableIfNotExists(tableDef) {
  try {
    const existing = await dynamodb.describeTable({ TableName: tableDef.TableName }).promise();
    console.log(`Table ${tableDef.TableName} already exists (status: ${existing.Table.TableStatus})`);
    return;
  } catch (err) {
    if (err.code !== 'ResourceNotFoundException') throw err;
  }

  console.log(`Creating table: ${tableDef.TableName}`);
  await dynamodb.createTable(tableDef).promise();
  // wait until active
  while (true) {
    const table = await dynamodb.describeTable({ TableName: tableDef.TableName }).promise();
    if (table.Table.TableStatus === 'ACTIVE') {
      console.log(`✅ Table ${tableDef.TableName} is ACTIVE`);
      break;
    }
    console.log(`Waiting for ${tableDef.TableName} to become ACTIVE...`);
    await new Promise(r => setTimeout(r, 3000));
  }
}

async function main() {
  console.log('AWS region:', region);
  const { tables, toDelete } = await listAndFilter();
  console.log('Existing tables:', tables.join(', ') || '(none)');

  if (toDelete.length === 0) {
    console.log('No known legacy/portfolio tables to delete were found.');
  } else {
    console.log('Tables that would be deleted:', toDelete.join(', '));
  }

  const confirmed = String(process.env.CONFIRM).toLowerCase() === 'true';
  if (!confirmed) {
    console.log('\nDRY RUN (no changes made).');
    console.log('To actually delete and recreate tables set CONFIRM=true and re-run:');
    console.log('  CONFIRM=true node scripts/clean-and-create-tables.js');
    return;
  }

  // perform deletions
  for (const t of toDelete) {
    await deleteTable(t);
  }

  // create desired tables
  for (const def of desiredCreates) {
    await createTableIfNotExists(def);
  }

  console.log('\nDone. Kept table: portfolio-users. Created / verified portfolio-assets and portfolio-transactions.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
