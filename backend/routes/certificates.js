const router = require('express').Router();
const { verifyCertificate, getMyCertificate, getMyCertificates, getAllCertificates, createCertificate, updateCertificate, deleteCertificate, getTemplate, uploadTemplate, getIdCardTemplate, uploadIdCardTemplate } = require('../controllers/certificateController');
const { protect, admin } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/cloudinary');
const Setting = require('../models/Setting');

router.get('/template', protect, admin, getTemplate);
router.post('/template', protect, admin, uploadDocument.single('template'), uploadTemplate);
router.get('/idcard-template', protect, admin, getIdCardTemplate);
router.post('/idcard-template', protect, admin, uploadDocument.single('template'), uploadIdCardTemplate);
router.get('/idcard-template/public', getIdCardTemplate);

// ID Card Settings (institute details)
router.get('/idcard-settings', async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'idCardSettings' });
    res.json({ success: true, settings: s ? s.value : {} });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/idcard-settings', protect, admin, async (req, res) => {
  try {
    await Setting.findOneAndUpdate({ key: 'idCardSettings' }, { key: 'idCardSettings', value: req.body }, { upsert: true, new: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Named download endpoint — sets proper filename for browser download
router.get('/download/:id', protect, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).select('certificateFile certificateNumber studentName');
    if (!cert?.certificateFile) return res.status(404).json({ success: false, message: 'File not found' });
    const filePath = require('path').join(__dirname, '..', cert.certificateFile);
    const ext = require('path').extname(cert.certificateFile) || '.pdf';
    const safeName = (cert.studentName || 'Student').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const safeCertNo = (cert.certificateNumber || cert._id.toString()).replace(/[/\\]/g, '-').replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `KCI_Certificate_${safeName}_${safeCertNo}${ext}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath, (err) => { if (err) res.status(404).json({ success: false, message: 'File not found' }); });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/verify/:certNumber', verifyCertificate);
router.get('/my-all', protect, getMyCertificates);
router.get('/my', protect, getMyCertificate);
router.get('/', protect, admin, getAllCertificates);
router.post('/', protect, admin, uploadDocument.single('certificateFile'), createCertificate);
router.put('/:id', protect, admin, uploadDocument.single('certificateFile'), updateCertificate);
router.delete('/:id', protect, admin, deleteCertificate);

module.exports = router;
