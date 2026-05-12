const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['broadcast', 'emergency', 'system'],
    default: 'broadcast'
  },
  target: {
    type: String,
    enum: ['all', 'ngo', 'volunteer'],
    default: 'all'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  extraData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
