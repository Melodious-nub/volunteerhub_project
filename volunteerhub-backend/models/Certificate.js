const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: 'Official recognition for outstanding dedication and social impact.'
  },
  issuedBy: {
    type: String,
    default: 'VolunteerHub'
  },
  ngo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  volunteer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign'
  },
  issueDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
