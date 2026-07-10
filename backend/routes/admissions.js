const router = require('express').Router();
const { submitAdmission, getAdmissions, getFranchiseAdmissions, updateAdmissionStatus, deleteAdmission } = require('../controllers/admissionController');
const { protect, admin } = require('../middleware/auth');

const franchiseOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'branch' || req.user.role === 'franchise')) return next();
  res.status(403).json({ success: false, message: 'Access denied' });
};

router.post('/', submitAdmission);
router.get('/', protect, admin, getAdmissions);
router.get('/my', protect, franchiseAuth, getFranchiseAdmissions);
router.put('/:id', protect, franchiseOrAdmin, updateAdmissionStatus);
router.delete('/:id', protect, admin, deleteAdmission);

module.exports = router;
