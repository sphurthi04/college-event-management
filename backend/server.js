/**
 * College Event Management System - Main Server
 * Entry point for the Express.js backend application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:5500'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/admin',       require('./routes/adminRoutes'));
app.use('/api/venues',      require('./routes/venueRoutes'));
app.use('/api/events',      require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/invitations', require('./routes/invitationRoutes'));
app.use('/api/certificates',require('./routes/certificateRoutes'));
app.use('/api/colleges',    require('./routes/collegeRoutes'));
app.use('/api/chatbot',     require('./routes/chatbotRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server running' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
