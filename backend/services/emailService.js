/**
 * Email Service
 * Handles all email sending using Nodemailer
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an email
 * @param {Object} options - { to, subject, html, attachments }
 */
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    await transporter.sendMail({
      from: `"College Event Management" <${process.env.EMAIL_USER}>`,
      to, subject, html, attachments
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Email failed to ${to}:`, error.message);
    // Don't throw - email failure shouldn't break the main flow
  }
};

module.exports = { sendEmail };
