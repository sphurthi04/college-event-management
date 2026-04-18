/**
 * Registration Controller
 * Handles student event registrations and attendance tracking
 */

const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

// @route POST /api/registrations
// @desc  Student registers for an event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId).populate('venue', 'name location');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status === 'cancelled') return res.status(400).json({ success: false, message: 'Event is cancelled' });
    if (event.registeredCount >= event.maxParticipants)
      return res.status(400).json({ success: false, message: 'Event is fully booked' });

    const existing = await Registration.findOne({ event: eventId, student: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already registered for this event' });

    const registration = await Registration.create({ event: eventId, student: req.user._id });
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

    // Send confirmation email
    const student = await User.findById(req.user._id);
    await sendEmail({
      to: student.email,
      subject: `Registration Confirmed - ${event.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
          <div style="background:#4F46E5;padding:20px;text-align:center">
            <h2 style="color:white;margin:0">Registration Confirmed!</h2>
          </div>
          <div style="padding:30px">
            <p>Hi <b>${student.name}</b>,</p>
            <p>You have successfully registered for:</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;background:#f5f5f5"><b>Event</b></td><td style="padding:8px">${event.title}</td></tr>
              <tr><td style="padding:8px;background:#f5f5f5"><b>Date</b></td><td style="padding:8px">${new Date(event.date).toDateString()}</td></tr>
              <tr><td style="padding:8px;background:#f5f5f5"><b>Time</b></td><td style="padding:8px">${event.startTime} - ${event.endTime}</td></tr>
              <tr><td style="padding:8px;background:#f5f5f5"><b>Venue</b></td><td style="padding:8px">${event.venue.name}, ${event.venue.location}</td></tr>
            </table>
            ${event.googleFormLink ? `<p style="margin-top:20px">Complete your registration: <a href="${event.googleFormLink}">Google Form</a></p>` : ''}
          </div>
        </div>`
    });

    res.status(201).json({ success: true, data: registration, message: 'Registered successfully. Confirmation email sent.' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Already registered for this event' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/registrations/my
// @desc  Get student's registrations
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({ path: 'event', populate: { path: 'venue', select: 'name location' } })
      .sort({ registeredAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/registrations/event/:eventId
// @desc  Organizer gets all registrations for their event
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email collegeName')
      .sort({ registeredAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/registrations/:id/attendance
// @desc  Organizer marks attendance
const markAttendance = async (req, res) => {
  try {
    const { attended } = req.body;
    const registration = await Registration.findById(req.params.id).populate('event');
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

    if (registration.event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    registration.attended = attended;
    registration.status = attended ? 'attended' : 'absent';
    if (attended) registration.attendedAt = new Date();
    await registration.save();

    res.json({ success: true, message: `Attendance marked as ${registration.status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/registrations/:eventId
// @desc  Student cancels registration
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOneAndDelete({ event: req.params.eventId, student: req.user._id });
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });
    await Event.findByIdAndUpdate(req.params.eventId, { $inc: { registeredCount: -1 } });
    res.json({ success: true, message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerForEvent, getMyRegistrations, getEventRegistrations, markAttendance, cancelRegistration };
