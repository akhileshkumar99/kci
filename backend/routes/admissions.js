const router = require('express').Router();
const { submitAdmission, getAdmissions, getFranchiseAdmissions, updateAdmissionStatus, deleteAdmission } = require('../controllers/admissionController');
const { protect, admin, branchOrAdmin } = require('../middleware/auth');

router.post('/', submitAdmission);
router.get('/', protect, admin, getAdmissions);
router.get('/my', protect, branchOrAdmin, getFranchiseAdmissions);
router.put('/:id', protect, branchOrAdmin, updateAdmissionStatus);
router.delete('/:id', protect, admin, deleteAdmission);

module.exports = router;
