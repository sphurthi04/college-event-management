/**
 * Venue Controller
 * Admin manages venues; organizers view venues of their college
 */

const Venue = require('../models/Venue');

// @route GET /api/venues
const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.json({ success: true, data: venues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/venues/:id
const getVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, data: venue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/venues  (Admin only)
const createVenue = async (req, res) => {
  try {
    const { name, capacity, location, college, description, facilities } = req.body;
    if (!name || !capacity || !location || !college)
      return res.status(400).json({ success: false, message: 'Name, capacity, location, and college are required' });

    const venue = await Venue.create({
      name, capacity, location, college, description,
      facilities: facilities ? facilities.split(',').map(f => f.trim()) : [],
      image: req.file ? req.file.path : null,
      createdBy: req.user?.id || null
    });
    res.status(201).json({ success: true, data: venue, message: 'Venue created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/venues/:id  (Admin only)
const updateVenue = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = req.file.path;
    if (updates.facilities && typeof updates.facilities === 'string')
      updates.facilities = updates.facilities.split(',').map(f => f.trim());

    const venue = await Venue.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, data: venue, message: 'Venue updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/venues/:id  (Admin only)
const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, message: 'Venue deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getVenues, getVenue, createVenue, updateVenue, deleteVenue };
