const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/campaigns
// @desc    Get all campaigns
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.ngo) {
      query.ngo = req.query.ngo;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const campaigns = await Campaign.find(query).populate('ngo', 'name email').sort('-createdAt');
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/campaigns/stats
// @desc    Get public stats for home page
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const totalNgos = await User.countDocuments({ role: 'ngo' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalCampaigns = await Campaign.countDocuments();
    const campaigns = await Campaign.find();
    const totalFundsRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);

    res.json({
      success: true,
      data: {
        totalNgos: totalNgos,
        totalVolunteers: totalVolunteers,
        totalCampaigns: totalCampaigns,
        totalFundsRaised: totalFundsRaised
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/campaigns/joined
// @desc    Get campaigns joined by current volunteer
router.get('/joined', protect, authorize('volunteer'), async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      volunteersJoined: req.user.id
    }).populate('ngo', 'name email');
    
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/campaigns/:id
// @desc    Get single campaign
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('ngo', 'name email');
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/campaigns/:id/join
// @desc    Join a campaign as volunteer
router.post('/:id/join', protect, authorize('volunteer'), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.volunteersJoined.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already joined this campaign' });
    }

    campaign.volunteersJoined.push(req.user.id);
    await campaign.save();

    res.json({ success: true, message: 'Successfully joined campaign' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/campaigns
// @desc    Create a campaign
router.post('/', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    req.body.ngo = req.user.id;
    const campaign = await Campaign.create(req.body);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
