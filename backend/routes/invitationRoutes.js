const express = require('express');
const router = express.Router();
const { sendInvitation, getInvitations, updateInvitationStatus } = require('../controllers/invitationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('organizer'), sendInvitation);
router.get('/', protect, authorize('organizer', 'admin'), getInvitations);
router.put('/:id/status', protect, authorize('admin'), updateInvitationStatus);

module.exports = router;
