/**
 * Certificate Model
 * Stores generated participation certificates
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, default: () => uuidv4(), unique: true },
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event:         { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  issuedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath:      { type: String },
  issuedAt:      { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);
