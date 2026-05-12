const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/donations
// @desc    Create a donation
router.post('/', async (req, res) => {
  try {
    const { campaignId, amount, paymentMethod, transactionId } = req.body;

    // Check if campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Create donation
    const donation = await Donation.create({
      campaign: campaignId,
      amount: Number(amount),
      paymentMethod,
      transactionId: transactionId || `VH-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
      status: 'completed'
    });

    // Update campaign raised amount
    campaign.raisedAmount += Number(amount);
    await campaign.save();

    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/donations/ngo
// @desc    Get donations for campaigns owned by current NGO
router.get('/ngo', protect, authorize('ngo'), async (req, res) => {
  try {
    const campaigns = await Campaign.find({ ngo: req.user.id });
    const campaignIds = campaigns.map(c => c._id);
    
    const donations = await Donation.find({ campaign: { $in: campaignIds } })
      .populate('campaign', 'title')
      .sort('-createdAt');
      
    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/donations
// @desc    Get all donations (Private - Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('campaign', 'title')
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
