const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: 'Task assigned for social contribution.'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'standard'],
    default: 'standard'
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  volunteer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  ngo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', TaskSchema);
