const express = require('express');
const router = express.Router();
const multer = require('multer');
const { fileController } = require('../controllers/fileController');

// Configure multer for memory storage and allow only .txt files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only text/plain (txt) files
    if (file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  }
});

// Routes
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/list', fileController.listFiles);
router.delete('/:key', fileController.deleteFile);

module.exports = router;