const router = require('express').Router();
const { verifyCertificate, getMyCertificate, getMyCertificates, getAllCertificates, createCertificate, updateCertificate, deleteCertificate, getTemplate, uploadTemplate, getIdCardTemplate, uploadIdCardTemplate } = require('../controllers/certificateController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/template', protect, admin, getTemplate);
router.post('/template', protect, admin, upload.single('template'), uploadTemplate);
router.get('/idcard-template', protect, admin, getIdCardTemplate);
router.post('/idcard-template', protect, admin, upload.single('template'), uploadIdCardTemplate);
router.get('/idcard-template/public', getIdCardTemplate);
router.get('/verify/:certNumber', verifyCertificate);
router.get('/my-all', protect, getMyCertificates);
router.get('/my', protect, getMyCertificate);
router.get('/', protect, admin, getAllCertificates);
router.post('/', protect, admin, upload.single('certificateFile'), createCertificate);
router.put('/:id', protect, admin, upload.single('certificateFile'), updateCertificate);
router.delete('/:id', protect, admin, deleteCertificate);

module.exports = router;
