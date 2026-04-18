/**
 * Authentication Controller
 * Handles login, registration, and token generation for all roles
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

// Generate JWT token
const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @route POST /api/auth/login
// @desc  Login for Admin, Organizer, Student
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    // Admin login (credentials from .env)
    if (email === process.env.ADMIN_EMAIL) {
      if (password !== process.env.ADMIN_PASSWORD)
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      const token = generateToken({ email, role: 'admin' });
      return res.json({ success: true, token, user: { name: process.env.ADMIN_NAME, email, role: 'admin' } });
    }

    // Organizer / Student login
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.role === 'organizer' && user.status !== 'approved')
      return res.status(403).json({ success: false, message: `Account is ${user.status}. Await admin approval.` });

    const token = generateToken({ id: user._id, role: user.role });
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, collegeName: user.collegeName, clubName: user.clubName } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/auth/register/organizer
// @desc  Register a new club organizer (status: pending)
const registerOrganizer = async (req, res) => {
  try {
    const { name, email, password, collegeName, clubName, phone } = req.body;
    if (!name || !email || !password || !collegeName || !clubName)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const organizer = await User.create({ name, email, password, role: 'organizer', collegeName, clubName, phone, status: 'pending', isVerified: true });

    // Notify admin via email
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Organizer Registration - Approval Required',
      html: `<h3>New organizer registration</h3><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>College:</b> ${collegeName}</p><p><b>Club:</b> ${clubName}</p><p>Please login to admin dashboard to approve or reject.</p>`
    });

    res.status(201).json({ success: true, message: 'Registration submitted. Await admin approval.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/auth/register/student
// @desc  Register a new student (auto-verified for immediate login)
const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    await User.create({ name, email, password, role: 'student', status: 'approved', isVerified: true });

    res.status(201).json({ success: true, message: 'Registration successful. You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/auth/verify-email
// @desc  Verify student email
const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    const user = await User.findOne({ email, verificationToken: token });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/auth/me
// @desc  Get current logged-in user
const getMe = async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.json({ success: true, user: req.user });
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { login, registerOrganizer, registerStudent, verifyEmail, getMe };
