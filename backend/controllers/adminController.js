/**
 * Admin Controller
 * Handles admin dashboard, organizer approvals, and system analytics
 */

const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Invitation = require('../models/Invitation');
const Registration = require('../models/Registration');
const { sendEmail } = require('../services/emailService');

// @route GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalOrganizers, totalStudents, totalVenues, totalEvents, pendingApprovals, sentInvitations, receivedInvitations] = await Promise.all([
      User.countDocuments({ role: 'organizer', status: 'approved' }),
      User.countDocuments({ role: 'student' }),
      Venue.countDocuments(),
      Event.countDocuments(),
      User.countDocuments({ role: 'organizer', status: 'pending' }),
      Invitation.countDocuments({ fromCollege: { $exists: true } }),
      Invitation.countDocuments({ toCollege: { $exists: true } })
    ]);
    res.json({ success: true, data: { totalOrganizers, totalStudents, totalVenues, totalEvents, pendingApprovals, sentInvitations, receivedInvitations } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/organizers
const getOrganizers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { role: 'organizer' };
    if (status) filter.status = status;
    const organizers = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: organizers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/admin/organizers/:id/approve
const approveOrganizer = async (req, res) => {
  try {
    const organizer = await User.findById(req.params.id);
    if (!organizer || organizer.role !== 'organizer')
      return res.status(404).json({ success: false, message: 'Organizer not found' });

    organizer.status = 'approved';
    await organizer.save();

    await sendEmail({
      to: organizer.email,
      subject: 'Account Approved - College Event Management',
      html: `<h3>Congratulations ${organizer.name}!</h3><p>Your organizer account has been <b>approved</b>. You can now login and start creating events.</p>`
    });

    res.json({ success: true, message: 'Organizer approved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/admin/organizers/:id/reject
const rejectOrganizer = async (req, res) => {
  try {
    const organizer = await User.findById(req.params.id);
    if (!organizer || organizer.role !== 'organizer')
      return res.status(404).json({ success: false, message: 'Organizer not found' });

    organizer.status = 'rejected';
    await organizer.save();

    await sendEmail({
      to: organizer.email,
      subject: 'Account Status Update - College Event Management',
      html: `<h3>Hello ${organizer.name},</h3><p>Your organizer account registration has been <b>rejected</b>. Please contact admin for more information.</p>`
    });

    res.json({ success: true, message: 'Organizer rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/students
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('venue', 'name location').populate('organizer', 'name collegeName').sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getOrganizers, approveOrganizer, rejectOrganizer, getStudents, getAllEvents };
