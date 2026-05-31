
const express = require('express');
const router = express.Router();

// rate limited
router.get('/hello', (req, res) => {
  res.json({
    message: 'Hello! Request allowed.',
    timestamp: new Date().toISOString(),
    ip: req.ip
  });
});

// Simulate a "heavy" endpoint
router.get('/data', (req, res) => {
  res.json({
    data: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      value: Math.random().toFixed(4)
    })),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
