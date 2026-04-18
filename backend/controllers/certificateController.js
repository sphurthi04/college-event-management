/**
 * Certificate Controller
 * Generates PDF certificates for attended students using PDFKit
 */

const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const Certificate = require('../models/Certificate');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

// Ensure certificates directory exists
const certDir = path.join(__dirname, '..', 'uploads', 'certificates');
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

// Generate PDF certificate
const generatePDF = (student, event, venue, certificateId) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(certDir, `${certificateId}.pdf`);
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f7ff');

    // Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(3).stroke('#4F46E5');
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1).stroke('#7C3AED');

    // Header
    doc.fillColor('#4F46E5').fontSize(36).font('Helvetica-Bold')
      .text('CERTIFICATE OF PARTICIPATION', 0, 80, { align: 'center' });

    // Decorative line
    doc.moveTo(100, 130).lineTo(doc.page.width - 100, 130).lineWidth(2).stroke('#7C3AED');

    // Body
    doc.fillColor('#333').fontSize(16).font('Helvetica')
      .text('This is to certify that', 0, 160, { align: 'center' });

    doc.fillColor('#4F46E5').fontSize(30).font('Helvetica-Bold')
      .text(student.name, 0, 190, { align: 'center' });

    doc.fillColor('#333').fontSize(16).font('Helvetica')
      .text('has successfully participated in', 0, 240, { align: 'center' });

    doc.fillColor('#7C3AED').fontSize(22).font('Helvetica-Bold')
      .text(event.title, 0, 270, { align: 'center' });

    doc.fillColor('#555').fontSize(14).font('Helvetica')
      .text(`Held on ${new Date(event.date).toDateString()} at ${venue}`, 0, 310, { align: 'center' })
      .text(`Time: ${event.startTime} - ${event.endTime}`, 0, 335, { align: 'center' });

    // Footer
    doc.moveTo(100, 380).lineTo(doc.page.width - 100, 380).lineWidth(1).stroke('#ccc');
    doc.fillColor('#888').fontSize(11)
      .text(`Certificate ID: ${certificateId}`, 60, 395)
      .text(`Issued on: ${new Date().toDateString()}`, 0, 395, { align: 'right', width: doc.page.width - 120 });

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

// @route POST /api/certificates/generate
// @desc  Organizer generates certificates for attended students
const generateCertificates = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId).populate('venue', 'name location');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const attendedRegistrations = await Registration.find({ event: eventId, attended: true })
      .populate('student', 'name email');

    if (!attendedRegistrations.length)
      return res.status(400).json({ success: false, message: 'No attended students found' });

    const results = [];
    for (const reg of attendedRegistrations) {
      // Skip if certificate already exists
      const existing = await Certificate.findOne({ student: reg.student._id, event: eventId });
      if (existing) { results.push({ student: reg.student.name, status: 'already exists' }); continue; }

      const cert = await Certificate.create({ student: reg.student._id, event: eventId, issuedBy: req.user._id });
      const filePath = await generatePDF(reg.student, event, event.venue.name, cert.certificateId);
      cert.filePath = filePath;
      await cert.save();

      // Email certificate
      await sendEmail({
        to: reg.student.email,
        subject: `Your Certificate - ${event.title}`,
        html: `<h3>Congratulations ${reg.student.name}!</h3><p>Your participation certificate for <b>${event.title}</b> is attached.</p>`,
        attachments: [{ filename: `certificate-${event.title}.pdf`, path: filePath }]
      });

      results.push({ student: reg.student.name, status: 'generated', certificateId: cert.certificateId });
    }

    res.json({ success: true, message: `Certificates processed for ${results.length} students`, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/certificates/my
// @desc  Student views their certificates
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('event', 'title date category')
      .populate('issuedBy', 'name collegeName')
      .sort({ issuedAt: -1 });
    res.json({ success: true, data: certificates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/certificates/download/:id
// @desc  Download certificate PDF
const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id });
    if (!cert || !cert.filePath) return res.status(404).json({ success: false, message: 'Certificate not found' });
    if (req.user.role === 'student' && cert.student.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    res.download(cert.filePath);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { generateCertificates, getMyCertificates, downloadCertificate };
