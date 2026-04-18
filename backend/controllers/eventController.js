/**
 * Event Controller
 * Organizers create/manage events with venue clash detection
 */

const Event = require('../models/Event');
const Venue = require('../models/Venue');

// Clash detection: checks if venue is already booked at the given date/time
const hasVenueClash = async (venueId, date, startTime, endTime, excludeEventId = null) => {
  const query = {
    venue: venueId,
    date: new Date(date),
    status: { $ne: 'cancelled' },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  };
  if (excludeEventId) query._id = { $ne: excludeEventId };
  const clash = await Event.findOne(query);
  return clash;
};

// @route GET /api/events
const getEvents = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'organizer') filter.organizer = req.user._id;
    const events = await Event.find(filter)
      .populate('venue', 'name location capacity college')
      .populate('organizer', 'name collegeName clubName')
      .sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/events/all  (public - for students)
const getAllPublicEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: { $in: ['upcoming', 'ongoing'] } })
      .populate('venue', 'name location capacity college')
      .populate('organizer', 'name collegeName clubName')
      .sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/events/:id
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('venue', 'name location capacity college description')
      .populate('organizer', 'name collegeName clubName email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/events  (Organizer only)
const createEvent = async (req, res) => {
  try {
    const { title, description, category, venue, date, startTime, endTime, maxParticipants, googleFormLink, isInterCollege } = req.body;

    if (!title || !description || !category || !venue || !date || !startTime || !endTime || !maxParticipants)
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });

    // Validate venue exists
    const venueDoc = await Venue.findById(venue);
    if (!venueDoc) return res.status(404).json({ success: false, message: 'Venue not found' });

    // Clash detection
    const clash = await hasVenueClash(venue, date, startTime, endTime);
    if (clash)
      return res.status(409).json({ success: false, message: `Venue is already booked from ${clash.startTime} to ${clash.endTime} on this date` });

    const event = await Event.create({
      title, description, category, venue, date, startTime, endTime,
      maxParticipants, googleFormLink, isInterCollege: isInterCollege || false,
      organizer: req.user._id,
      banner: req.file ? req.file.path : null
    });

    const populated = await event.populate(['venue', 'organizer']);
    res.status(201).json({ success: true, data: populated, message: 'Event created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/events/:id  (Organizer only)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });

    const { venue, date, startTime, endTime } = req.body;
    // Re-check clash if time/venue changed
    if (venue || date || startTime || endTime) {
      const clash = await hasVenueClash(
        venue || event.venue, date || event.date,
        startTime || event.startTime, endTime || event.endTime, event._id
      );
      if (clash)
        return res.status(409).json({ success: false, message: `Venue clash: already booked from ${clash.startTime} to ${clash.endTime}` });
    }

    const updates = { ...req.body };
    if (req.file) updates.banner = req.file.path;
    const updated = await Event.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('venue').populate('organizer');
    res.json({ success: true, data: updated, message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/events/venue/:venueId/availability
const checkVenueAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const events = await Event.find({ venue: req.params.venueId, date: new Date(date), status: { $ne: 'cancelled' } })
      .select('title startTime endTime status');
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getEvents, getAllPublicEvents, getEvent, createEvent, updateEvent, deleteEvent, checkVenueAvailability };
