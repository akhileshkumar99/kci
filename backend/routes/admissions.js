const router = require('express').Router();
const { submitAdmission, getAdmissions, updateAdmissionStatus, deleteAdmission } = require('../controllers/admissionController');
const { protect, admin } = require('../middleware/auth');

router.post('/', submitAdmission);
router.get('/', protect, admin, getAdmissions);
router.put('/:id', protect, admin, updateAdmissionStatus);
router.delete('/:id', protect, admin, deleteAdmission);

module.exports = router;
