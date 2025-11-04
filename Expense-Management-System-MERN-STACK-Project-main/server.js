require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

// Create DynamoDB instance
const dynamodb = new AWS.DynamoDB();

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;

// Verify DynamoDB connection and start server
const start = async () => {
  try {
    // Test DynamoDB connection
    await dynamodb.listTables().promise();
    console.log("✅ Successfully connected to DynamoDB");
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to DynamoDB:", error.message);
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
