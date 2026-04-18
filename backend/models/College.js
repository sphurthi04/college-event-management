/**
 * College Model
 * Stores college information managed by admin
 */

const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true, trim: true },
  location: { type: String, trim: true },
  email:    { type: String, trim: true },
  phone:    { type: String, trim: true },
  website:  { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('College', collegeSchema);
