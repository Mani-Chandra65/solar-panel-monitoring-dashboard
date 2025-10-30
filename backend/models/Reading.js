const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  voltage: {
    type: Number,
    required: true,
    min: 0
  },
  current: {
    type: Number,
    required: true,
    min: 0
  },
  power: {
    type: Number,
    required: true,
    min: 0
  },
  temperature: {
    type: Number,
    required: true
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  anomalyReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
readingSchema.index({ timestamp: -1 });
readingSchema.index({ isAnomaly: 1 });

module.exports = mongoose.model('Reading', readingSchema);
