require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const AWS = require('aws-sdk');

// Configure AWS / DynamoDB Local support
const useLocal = String(process.env.USE_LOCAL_DYNAMO || '').toLowerCase() === 'true';
const localEndpoint = process.env.DYNAMO_ENDPOINT || 'http://127.0.0.1:8000';

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || (useLocal ? 'local' : undefined),
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || (useLocal ? 'local' : undefined),
  sessionToken: process.env.AWS_SESSION_TOKEN
});

// Create DynamoDB instance (respect local endpoint)
const dynamodb = new AWS.DynamoDB(useLocal ? { endpoint: localEndpoint } : {});

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/v1/users", require("./routes/userRoute"));
app.use("/api/v1/portfolio", require("./routes/portfolioRoute"));
app.use("/api/v1/admin", require("./routes/adminRoute"));
app.use("/api/v1/files", require("./routes/fileRoute"));
app.use("/api/v1/expenses", require("./routes/expenseRoute"));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

// When using local DynamoDB, ensure required tables exist
const ensureLocalTables = async () => {
  if (!useLocal) return;
  const tables = [
    {
      TableName: 'portfolio-users',
      KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'email-index',
          KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }
      ],
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

  for (const def of tables) {
    try {
      await dynamodb.describeTable({ TableName: def.TableName }).promise();
    } catch (err) {
      if (err && err.code === 'ResourceNotFoundException') {
        await dynamodb.createTable(def).promise();
        await dynamodb.waitFor('tableExists', { TableName: def.TableName }).promise();
      } else {
        throw err;
      }
    }
  }
};

// Start server without testing DynamoDB connection (due to restricted permissions)
const start = async () => {
  try {
    // Create local tables if using local DynamoDB
    if (useLocal) {
      await ensureLocalTables();
    }
    
    // Skip listTables check due to AWS Academy restrictions
    console.log("✅ Starting server (DynamoDB connection will be tested on first request)");
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    if (error.code === 'ExpiredToken') {
      console.log("⚠️ AWS session token has expired. Please get new credentials from AWS Academy.");
    }
    process.exit(1);
  }
};

start();

// Global error handler (to catch multer fileFilter errors and others)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err && err.message ? err.message : err);
  if (err && err.message && err.message.includes('Only .txt files')) {
    return res.status(400).json({ success: false, error: err.message });
  }
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});
