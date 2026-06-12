const router = require('express').Router();
const { submitAdmission, getAdmissions, getFranchiseAdmissions, updateAdmissionStatus, deleteAdmission } = require('../controllers/admissionController');
const { protect, admin } = require('../middleware/auth');

const franchiseAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'franchise' || req.user.role === 'admin' || req.user.role === 'branch')) return next();
  res.status(403).json({ success: false, message: 'Access denied' });
};

router.post('/', submitAdmission);
router.get('/', protect, admin, getAdmissions);
router.get('/my', protect, franchiseAuth, getFranchiseAdmissions);
router.put('/:id', protect, admin, updateAdmissionStatus);
router.delete('/:id', protect, admin, deleteAdmission);

module.exports = router;
