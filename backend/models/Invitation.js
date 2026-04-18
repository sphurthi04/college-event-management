/**
 * Invitation Model
 * Manages inter-college event invitations
 */

const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  event:          { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  sentBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromCollege:    { type: String, required: true },
  toCollege:      { type: String, required: true },
  toEmail:        { type: String, required: true },
  message:        { type: String },
  status:         { type: String, enum: ['sent', 'accepted', 'declined', 'pending'], default: 'sent' },
  sentAt:         { type: Date, default: Date.now },
  respondedAt:    { type: Date }
});

module.exports = mongoose.model('Invitation', invitationSchema);
