/**
 * Venue Model
 * Stores venue details added by admin
 */

const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  capacity:    { type: Number, required: true },
  location:    { type: String, required: true, trim: true },
  college:     { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  facilities:  [{ type: String }],
  image:       { type: String },
  status:      { type: String, enum: ['available', 'maintenance', 'inactive'], default: 'available' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venue', venueSchema);
