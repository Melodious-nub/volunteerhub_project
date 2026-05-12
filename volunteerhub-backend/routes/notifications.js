const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get notifications for logged in user (broadcasts + role specific)
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { target: 'all' },
        { target: req.user.role }
      ]
    }).sort('-createdAt').limit(10);

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/notifications
// @desc    Create a broadcast notification (Admin only)
const { authorize } = require('../middleware/auth');
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, message, type, target } = req.body;
    
    const notification = await Notification.create({
      title,
      message,
      type: type || 'broadcast',
      target: target || 'all',
      sender: req.user.id
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
