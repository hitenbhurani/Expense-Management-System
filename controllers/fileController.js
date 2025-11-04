const { s3Helper } = require('../config/s3');

const fileController = {
  // Upload a file
  uploadFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const result = await s3Helper.uploadFile(req.file, userId);
      
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        file: result
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // List all files for a user
  listFiles: async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const files = await s3Helper.listUserFiles(userId);
      
      res.status(200).json({
        success: true,
        files
      });
    } catch (error) {
      console.error('List files error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Delete a file
  deleteFile: async (req, res) => {
    try {
      const { key } = req.params;
      const userId = req.query.userId;

      // Security check - ensure user can only delete their own files
      if (!key.startsWith(`${userId}/`)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this file'
        });
      }

      await s3Helper.deleteFile(key);
      
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = {
  fileController
};