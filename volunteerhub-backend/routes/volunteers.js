const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Task = require('../models/Task');
const Certificate = require('../models/Certificate');

// @route   GET /api/volunteers/stats
// @desc    Get volunteer dashboard stats
router.get('/stats', protect, authorize('volunteer'), async (req, res) => {
  try {
    const joinedCampaigns = await Campaign.find({ volunteersJoined: req.user.id });
    const completedTasks = await Task.countDocuments({ volunteer: req.user.id, status: 'completed' });
    const totalDonations = await Donation.find({ user: req.user.id });
    const certificates = await Certificate.countDocuments({ volunteer: req.user.id });

    const totalDonated = totalDonations.reduce((acc, d) => acc + d.amount, 0);
    
    // Simple point system: 100 points per joined campaign + 1 point per 100 taka donated + 50 points per task
    const points = (joinedCampaigns.length * 100) + Math.floor(totalDonated / 100) + (completedTasks * 50);

    res.json({
      success: true,
      data: {
        tasksCompleted: completedTasks,
        volunteerHours: req.user.volunteerHours || 0,
        pointsEarned: req.user.points || 0,
        certificates: certificates,
        joinedCampaignsCount: joinedCampaigns.length,
        totalDonated: totalDonated
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/volunteers/tasks
// @desc    Get tasks assigned to volunteer
router.get('/tasks', protect, authorize('volunteer'), async (req, res) => {
  try {
    const tasks = await Task.find({ volunteer: req.user.id })
      .populate('ngo', 'name')
      .populate('campaign', 'title')
      .sort('-createdAt');

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/volunteers/tasks/:id/complete
// @desc    Mark task as completed
router.patch('/tasks/:id/complete', protect, authorize('volunteer'), async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, volunteer: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = 'completed';
    await task.save();

    // Update volunteer's hours and points
    // 1 task = 2 hours + 50 points
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { volunteerHours: 2, points: 50 }
    });

    res.json({ success: true, message: 'Task marked as completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/volunteers/certificates
// @desc    Get certificates for volunteer
router.get('/certificates', protect, authorize('volunteer'), async (req, res) => {
  try {
    const certificates = await Certificate.find({ volunteer: req.user.id })
      .populate('campaign', 'title')
      .sort('-issueDate');

    res.json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/volunteers/history
// @desc    Get activity history
router.get('/history', protect, authorize('volunteer'), async (req, res) => {
  try {
    const joined = await Campaign.find({ volunteersJoined: req.user.id }).select('title location category createdAt');
    const donations = await Donation.find({ user: req.user.id }).populate('campaignId', 'title').sort('-createdAt');
    const tasks = await Task.find({ volunteer: req.user.id, status: 'completed' }).sort('-createdAt');

    const history = [
      ...joined.map(c => ({ type: 'campaign', title: 'Joined Mission', description: `Signed up for "${c.title}"`, date: c.createdAt, tags: ['Campaign'] })),
      ...donations.map(d => ({ type: 'donation', title: 'Donation Made', description: `Contributed ৳${d.amount} to "${d.campaignId?.title}"`, date: d.createdAt, tags: ['Donation'] })),
      ...tasks.map(t => ({ type: 'task', title: 'Task Completed', description: `Finished "${t.title}"`, date: t.createdAt, tags: ['Task'] }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
