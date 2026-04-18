const express = require('express');
const router = express.Router();
const { registerForEvent, getMyRegistrations, getEventRegistrations, markAttendance, cancelRegistration } = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), registerForEvent);
router.get('/my', protect, authorize('student'), getMyRegistrations);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventRegistrations);
router.put('/:id/attendance', protect, authorize('organizer'), markAttendance);
router.delete('/:eventId', protect, authorize('student'), cancelRegistration);

module.exports = router;
