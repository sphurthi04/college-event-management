const express = require('express');
const router = express.Router();
const { getDashboard, getOrganizers, approveOrganizer, rejectOrganizer, getStudents, getAllEvents } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/organizers', getOrganizers);
router.put('/organizers/:id/approve', approveOrganizer);
router.put('/organizers/:id/reject', rejectOrganizer);
router.get('/students', getStudents);
router.get('/events', getAllEvents);

module.exports = router;
