const express = require('express');
const router = express.Router();
const { getEvents, getAllPublicEvents, getEvent, createEvent, updateEvent, deleteEvent, checkVenueAvailability } = require('../controllers/eventController');
const { protect, authorize, approvedOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/all', protect, getAllPublicEvents);
router.get('/venue/:venueId/availability', protect, checkVenueAvailability);
router.get('/', protect, getEvents);
router.get('/:id', protect, getEvent);
router.post('/', protect, authorize('organizer'), approvedOnly, upload.single('banner'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('banner'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
