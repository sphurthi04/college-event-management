const express = require('express');
const router = express.Router();
const { getColleges, createCollege, updateCollege, deleteCollege } = require('../controllers/collegeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getColleges);
router.post('/', protect, authorize('admin'), createCollege);
router.put('/:id', protect, authorize('admin'), updateCollege);
router.delete('/:id', protect, authorize('admin'), deleteCollege);

module.exports = router;
