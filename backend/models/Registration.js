/**
 * Registration Model
 * Tracks student event registrations and attendance
 */

const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:     { type: String, enum: ['registered', 'attended', 'absent', 'cancelled'], default: 'registered' },
  attended:   { type: Boolean, default: false },
  registeredAt: { type: Date, default: Date.now },
  attendedAt:   { type: Date }
});

// Prevent duplicate registrations
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
