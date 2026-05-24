const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { put } = require('@vercel/blob');
const { v4: uuidv4 } = require('uuid');
const basicAuth = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/upload — admin only
router.post('/', basicAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname);
    const filename = `uploads/${uuidv4()}${ext}`;

    const blob = await put(filename, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: req.file.mimetype,
    });

    res.json({ url: blob.url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
