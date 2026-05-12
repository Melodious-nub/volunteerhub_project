const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Disaster Relief', 'Healthcare', 'Education', 'Environment', 'Food', 'Clothing', 'Others']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  image: String,
  goalAmount: {
    type: Number,
    required: [true, 'Please add a goal amount']
  },
  raisedAmount: {
    type: Number,
    default: 0
  },
  volunteersRequired: {
    type: Number,
    default: 0
  },
  volunteersJoined: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  ngo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  updates: [{
    title: String,
    message: String,
    date: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
