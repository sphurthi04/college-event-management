const express = require('express');
const router = express.Router();
const { getVenues, getVenue, createVenue, updateVenue, deleteVenue } = require('../controllers/venueController');
const { protect, authorize, approvedOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getVenues);
router.get('/:id', protect, getVenue);
router.post('/', protect, authorize('admin'), upload.single('image'), createVenue);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateVenue);
router.delete('/:id', protect, authorize('admin'), deleteVenue);

module.exports = router;
