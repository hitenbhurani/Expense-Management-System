const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const s3 = new AWS.S3();

// Read bucket name from environment variable
const S3_BUCKET = process.env.S3_BUCKET || 'portfolio-uploads-12345';

const s3Helper = {
  async ensureBucketExists() {
    try {
      await s3.headBucket({ Bucket: S3_BUCKET }).promise();
      return true;
    } catch (err) {
      // If bucket not found, try to create it (may fail due to permissions)
      if (err.statusCode === 404 || err.code === 'NotFound' || err.code === 'NoSuchBucket') {
        console.log(`Bucket ${S3_BUCKET} not found, attempting to create it...`);
        try {
          const createParams = { Bucket: S3_BUCKET };
          // If region is not us-east-1, LocationConstraint must be set
          if (process.env.AWS_REGION && process.env.AWS_REGION !== 'us-east-1') {
            createParams.CreateBucketConfiguration = { LocationConstraint: process.env.AWS_REGION };
          }
          await s3.createBucket(createParams).promise();
          // wait until bucket exists
          await s3.waitFor('bucketExists', { Bucket: S3_BUCKET }).promise();
          console.log(`Bucket ${S3_BUCKET} created successfully.`);
          return true;
        } catch (createErr) {
          console.error('Failed to create bucket:', createErr && createErr.message ? createErr.message : createErr);
          throw new Error(`S3 bucket ${S3_BUCKET} does not exist and could not be created: ${createErr.message || createErr}`);
        }
      }
      throw err;
    }
  },
  async uploadFile(file, userId) {
    // Ensure bucket exists (or attempt to create)
    await this.ensureBucketExists();

    const key = `${userId}/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    try {
      const result = await s3.upload(params).promise();
      return {
        url: result.Location,
        key: result.Key
      };
    } catch (error) {
      console.error('S3 upload error:', error && error.message ? error.message : error);
      throw error;
    }
  },

  async deleteFile(key) {
    const params = {
      Bucket: S3_BUCKET,
      Key: key
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw error;
    }
  },

  async listUserFiles(userId) {
    const params = {
      Bucket: S3_BUCKET,
      Prefix: `${userId}/`
    };

    try {
      const result = await s3.listObjectsV2(params).promise();
      return result.Contents.map(item => ({
        key: item.Key,
    url: `https://${S3_BUCKET}.s3.amazonaws.com/${item.Key}`,
        lastModified: item.LastModified,
        size: item.Size
      }));
    } catch (error) {
      console.error('S3 list error:', error);
      throw error;
    }
  }
};

module.exports = {
  s3,
  s3Helper,
  S3_BUCKET
};