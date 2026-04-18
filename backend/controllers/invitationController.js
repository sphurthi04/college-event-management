/**
 * Invitation Controller
 * Manages inter-college event invitations
 */

const Invitation = require('../models/Invitation');
const Event = require('../models/Event');
const { sendEmail } = require('../services/emailService');

// @route POST /api/invitations
// @desc  Organizer sends invitation to another college
const sendInvitation = async (req, res) => {
  try {
    const { eventId, toCollege, toEmail, message } = req.body;
    if (!eventId || !toCollege || !toEmail)
      return res.status(400).json({ success: false, message: 'Event, college, and email are required' });

    const event = await Event.findById(eventId).populate('venue', 'name location');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const invitation = await Invitation.create({
      event: eventId,
      sentBy: req.user._id,
      fromCollege: req.user.collegeName,
      toCollege, toEmail, message
    });

    // Send invitation email
    await sendEmail({
      to: toEmail,
      subject: `Event Invitation from ${req.user.collegeName} - ${event.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
          <div style="background:#7C3AED;padding:20px;text-align:center">
            <h2 style="color:white;margin:0">You're Invited!</h2>
          </div>
          <div style="padding:30px">
            <p>Dear <b>${toCollege}</b>,</p>
            <p><b>${req.user.collegeName}</b> cordially invites you to:</p>
            <h3 style="color:#4F46E5">${event.title}</h3>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;background:#f5f5f5"><b>Date</b></td><td style="padding:8px">${new Date(event.date).toDateString()}</td></tr>
              <tr><td style="padding:8px;background:#f5f5f5"><b>Time</b></td><td style="padding:8px">${event.startTime} - ${event.endTime}</td></tr>
              <tr><td style="padding:8px;background:#f5f5f5"><b>Venue</b></td><td style="padding:8px">${event.venue.name}, ${event.venue.location}</td></tr>
              <tr><td style="padding:8px;background:#f5f5f5"><b>Category</b></td><td style="padding:8px">${event.category}</td></tr>
            </table>
            ${message ? `<p style="margin-top:20px;padding:15px;background:#f0f0ff;border-radius:5px"><i>${message}</i></p>` : ''}
            <p style="margin-top:20px">Sent by: <b>${req.user.name}</b> (${req.user.clubName})</p>
          </div>
        </div>`
    });

    res.status(201).json({ success: true, data: invitation, message: 'Invitation sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/invitations
// @desc  Get invitations (admin sees all, organizer sees their own)
const getInvitations = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { sentBy: req.user._id };
    const invitations = await Invitation.find(filter)
      .populate('event', 'title date startTime endTime')
      .populate('sentBy', 'name collegeName clubName')
      .sort({ sentAt: -1 });
    res.json({ success: true, data: invitations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/invitations/:id/status
// @desc  Update invitation status
const updateInvitationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invitation = await Invitation.findByIdAndUpdate(
      req.params.id,
      { status, respondedAt: new Date() },
      { new: true }
    );
    if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found' });
    res.json({ success: true, data: invitation, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendInvitation, getInvitations, updateInvitationStatus };
