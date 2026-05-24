const express = require('express');
const router = express.Router();
const basicAuth = require('../middleware/auth');

// GET /api/auth/verify
router.get('/verify', basicAuth, (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

module.exports = router;
