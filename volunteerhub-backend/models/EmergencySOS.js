const mongoose = require('mongoose');

const EmergencySOSSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  notifiedTo: {
    type: String,
    enum: ['admin', 'ngo', 'both'],
    default: 'admin'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String
  },
  description: {
    type: String,
    required: [true, 'Please add a description of the emergency']
  },
  type: {
    type: String,
    enum: ['Medical', 'Fire', 'Flood', 'Accident', 'Others'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'responding', 'resolved'],
    default: 'pending'
  },
  responders: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

EmergencySOSSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmergencySOS', EmergencySOSSchema);
