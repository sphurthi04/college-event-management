const express = require('express');
const router = express.Router();
const { login, registerOrganizer, registerStudent, verifyEmail, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/register/organizer', registerOrganizer);
router.post('/register/student', registerStudent);
router.get('/verify-email', verifyEmail);
router.get('/me', protect, getMe);

module.exports = router;
