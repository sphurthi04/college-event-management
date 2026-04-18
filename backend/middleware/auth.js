/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle admin (stored in .env, not DB)
    if (decoded.role === 'admin') {
      req.user = { _id: 'admin', email: decoded.email, role: 'admin', name: process.env.ADMIN_NAME };
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Role-based access control
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized` });
  }
  next();
};

// Organizer must be approved
const approvedOnly = (req, res, next) => {
  if (req.user.role === 'organizer' && req.user.status !== 'approved') {
    return res.status(403).json({ success: false, message: 'Your account is pending admin approval' });
  }
  next();
};

module.exports = { protect, authorize, approvedOnly };
