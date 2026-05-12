const express = require('express');
const router = express.Router();
const EmergencySOS = require('../models/EmergencySOS');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

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

// @route   GET /api/sos/:id
// @desc    Get SOS details
router.get('/:id', async (req, res) => {
  try {
    const request = await EmergencySOS.findById(req.params.id).populate('user', 'name phone email');
    if (!request) return res.status(404).json({ success: false, message: 'SOS not found' });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/sos
// @desc    Create an SOS request and notify Admin/NGOs
router.post('/', async (req, res) => {
  try {
    const request = await EmergencySOS.create(req.body);

    // Create Notification for Admin/NGOs (NOT volunteers)
    let target = 'all';
    if (request.notifiedTo === 'admin') target = 'all'; 
    if (request.notifiedTo === 'ngo') target = 'ngo';
    if (request.notifiedTo === 'both') target = 'all';

    await Notification.create({
      title: `🚨 EMERGENCY SOS: ${request.type}`,
      message: `A critical SOS alert has been triggered: ${request.description}. Action required.`,
      type: 'emergency',
      target: target,
      sender: request.user || null,
      extraData: { 
        sosId: request._id,
        location: request.location,
        type: request.type
      }
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/sos/:id/resolve
// @desc    Resolve an SOS request (Admin/NGO only)
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const request = await EmergencySOS.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
