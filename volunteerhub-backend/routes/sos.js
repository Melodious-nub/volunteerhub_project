const express = require('express');
const router = express.Router();
const EmergencySOS = require('../models/EmergencySOS');

// @route   GET /api/sos
// @desc    Get all active SOS requests
router.get('/', async (req, res) => {
  try {
    const requests = await EmergencySOS.find({ status: { $ne: 'resolved' } }).populate('user', 'name phone');
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/sos
// @desc    Create an SOS request
router.post('/', async (req, res) => {
  try {
    const request = await EmergencySOS.create(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
