const router = require('express').Router();
const { submitAdmission, getAdmissions, getFranchiseAdmissions, updateAdmissionStatus, deleteAdmission, editAdmission } = require('../controllers/admissionController');
const { protect, admin, branchOrAdmin, staffOrAbove } = require('../middleware/auth');

router.post('/', submitAdmission);
router.get('/', protect, admin, getAdmissions);
router.get('/my', protect, branchOrAdmin, getFranchiseAdmissions);
// PATCH = edit fields (branch or admin), PUT = status update (branch or admin)
router.patch('/:id', protect, branchOrAdmin, editAdmission);
router.put('/:id', protect, branchOrAdmin, updateAdmissionStatus);
router.delete('/:id', protect, admin, deleteAdmission);

module.exports = router;
