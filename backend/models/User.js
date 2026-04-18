/**
 * User Model
 * Handles Admin, Organizer, and Student roles
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'organizer', 'student'], required: true },

  // Organizer-specific fields
  collegeName: { type: String, trim: true },
  clubName:    { type: String, trim: true },
  phone:       { type: String, trim: true },

  // Organizer approval status
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },

  // Student email verification
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },

  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
