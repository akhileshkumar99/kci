const router = require('express').Router();
const { verifyCertificate, getMyCertificate, getAllCertificates, createCertificate, updateCertificate, deleteCertificate } = require('../controllers/certificateController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/verify/:certNumber', verifyCertificate);
router.get('/my', protect, getMyCertificate);
router.get('/', protect, admin, getAllCertificates);
router.post('/', protect, admin, upload.single('certificateFile'), createCertificate);
router.put('/:id', protect, admin, upload.single('certificateFile'), updateCertificate);
router.delete('/:id', protect, admin, deleteCertificate);

module.exports = router;
