/**
 * Event Model
 * Stores event details created by organizers
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  description:     { type: String, required: true },
  category:        { type: String, enum: ['technical', 'cultural', 'sports', 'academic', 'workshop', 'seminar', 'fest', 'other'], required: true },
  venue:           { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  organizer:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:            { type: Date, required: true },
  startTime:       { type: String, required: true },  // "HH:MM" format
  endTime:         { type: String, required: true },  // "HH:MM" format
  maxParticipants: { type: Number, required: true },
  googleFormLink:  { type: String, trim: true },
  banner:          { type: String },
  status:          { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  isInterCollege:  { type: Boolean, default: false },
  seatingLayout:   { type: String },  // JSON string for layout
  registeredCount: { type: Number, default: 0 },
  createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
