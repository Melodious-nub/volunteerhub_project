const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Task = require('../models/Task');
const Certificate = require('../models/Certificate');

// @route   GET /api/ngo/volunteers
// @desc    Get all volunteers who joined NGO's campaigns
router.get('/volunteers', protect, authorize('ngo'), async (req, res) => {
  try {
    const campaigns = await Campaign.find({ ngo: req.user.id });
    const volunteerIds = [...new Set(campaigns.flatMap(c => c.volunteersJoined))];
    
    const volunteers = await User.find({ _id: { $in: volunteerIds } }).select('name email phone location skills volunteerHours points');
    
    // Map campaigns to volunteers for easier frontend usage
    const volunteersWithCampaigns = volunteers.map(v => {
      const joinedCampaigns = campaigns.filter(c => c.volunteersJoined.includes(v._id.toString())).map(c => ({ _id: c._id, title: c.title }));
      return { ...v.toObject(), joinedCampaigns };
    });

    res.json({ success: true, data: volunteersWithCampaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/ngo/tasks
// @desc    Assign a task to a volunteer
router.post('/tasks', protect, authorize('ngo'), async (req, res) => {
  try {
    const { title, description, priority, dueDate, volunteerId, campaignId } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      volunteer: volunteerId,
      ngo: req.user.id,
      campaign: campaignId
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/ngo/tasks
// @desc    Get all tasks created by NGO
router.get('/tasks', protect, authorize('ngo'), async (req, res) => {
  try {
    const tasks = await Task.find({ ngo: req.user.id })
      .populate('volunteer', 'name email')
      .populate('campaign', 'title')
      .sort('-createdAt');

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/ngo/certificates
// @desc    Issue a certificate to a volunteer
router.post('/certificates', protect, authorize('ngo'), async (req, res) => {
  try {
    const { name, description, volunteerId, campaignId } = req.body;

    const certificate = await Certificate.create({
      name,
      description,
      volunteer: volunteerId,
      campaign: campaignId,
      ngo: req.user.id,
      issuedBy: req.user.name
    });

    // Award bonus points for receiving a certificate
    await User.findByIdAndUpdate(volunteerId, { $inc: { points: 500 } });

    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/ngo/certificates
// @desc    Get all certificates issued by NGO
router.get('/certificates', protect, authorize('ngo'), async (req, res) => {
  try {
    const certificates = await Certificate.find({ ngo: req.user.id })
      .populate('volunteer', 'name email')
      .populate('campaign', 'title')
      .sort('-issueDate');

    res.json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
