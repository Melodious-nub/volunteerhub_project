const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const { protect, authorize } = require('../middleware/auth');

// All routes here are protected and only for admin
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalNgos = await User.countDocuments({ role: 'ngo' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    
    const campaigns = await Campaign.find();
    const totalFundsRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);

    res.json({
      success: true,
      data: {
        totalNgos,
        totalVolunteers,
        totalCampaigns,
        activeCampaigns,
        totalFundsRaised
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/ngos
// @desc    Get all NGOs
router.get('/ngos', async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo' }).sort('-createdAt');
    res.json({ success: true, data: ngos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/volunteers
// @desc    Get all volunteers
router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).sort('-createdAt');
    res.json({ success: true, data: volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/campaigns
// @desc    Get all campaigns with NGO info
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('ngo', 'name email').sort('-createdAt');
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user status or details
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/campaigns/:id
// @desc    Update campaign details
router.put('/campaigns/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/campaigns/:id
// @desc    Delete a campaign
router.delete('/campaigns/:id', async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/activities
// @desc    Get recent platform activities
router.get('/activities', async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort('-createdAt')
      .limit(5)
      .select('name role createdAt');
    
    const recentCampaigns = await Campaign.find()
      .sort('-createdAt')
      .limit(5)
      .populate('ngo', 'name');

    // Map activities
    const activities = [
      ...recentUsers.map(u => ({
        type: 'user',
        title: `New ${u.role === 'ngo' ? 'NGO' : 'Volunteer'} Joined`,
        desc: `${u.name} has registered on the platform.`,
        time: u.createdAt,
        icon: u.role === 'ngo' ? 'fas fa-building' : 'fas fa-user-check',
        bg: u.role === 'ngo' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
      })),
      ...recentCampaigns.map(c => ({
        type: 'campaign',
        title: 'New Mission Launched',
        desc: `"${c.title}" by ${c.ngo?.name || 'NGO'}.`,
        time: c.createdAt,
        icon: 'fas fa-bullhorn',
        bg: 'bg-orange-100 text-orange-600'
      }))
    ].sort((a, b) => b.time - a.time).slice(0, 8);

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/notifications
// @desc    Broadcast an alert to the platform
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, target, type } = req.body;
    const Notification = require('../models/Notification');
    
    const notification = await Notification.create({
      title,
      message,
      target: target || 'all',
      type: type || 'broadcast',
      sender: req.user.id
    });

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
