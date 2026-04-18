const express = require('express');
const router = express.Router();
const { generateCertificates, getMyCertificates, downloadCertificate } = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

router.post('/generate', protect, authorize('organizer'), generateCertificates);
router.get('/my', protect, authorize('student'), getMyCertificates);
router.get('/download/:id', protect, downloadCertificate);

module.exports = router;
