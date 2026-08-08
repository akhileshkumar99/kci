const router = require('express').Router();
const { verifyCertificate, getMyCertificate, getMyCertificates, getAllCertificates, createCertificate, updateCertificate, deleteCertificate, getTemplate, uploadTemplate, getIdCardTemplate, uploadIdCardTemplate } = require('../controllers/certificateController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Setting = require('../models/Setting');
const Certificate = require('../models/Certificate');
const path = require('path');

router.get('/template', protect, admin, getTemplate);
router.post('/template', protect, admin, upload.single('template'), uploadTemplate);
router.get('/idcard-template', protect, admin, getIdCardTemplate);
router.post('/idcard-template', protect, admin, upload.single('template'), uploadIdCardTemplate);
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

// Named download endpoint — redirects to static file with proper filename via Content-Disposition
router.get('/download/:id', async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).select('certificateFile certificateNumber studentName');
    if (!cert?.certificateFile) return res.status(404).json({ success: false, message: 'File not found' });
    const ext = path.extname(cert.certificateFile) || '.pdf';
    const safeName = (cert.studentName || 'Student').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const safeCertNo = (cert.certificateNumber || cert._id.toString()).replace(/[\/\\]/g, '-').replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `KCI_Certificate_${safeName}_${safeCertNo}${ext}`;
    // Stream file directly — works on both local and Render
    const fs = require('fs');
    const filePath = path.join(__dirname, '..', cert.certificateFile);
    if (!fs.existsSync(filePath)) {
      // File not on disk (Render ephemeral) — redirect to static URL so browser downloads it
      const staticUrl = cert.certificateFile.startsWith('/') ? cert.certificateFile : `/${cert.certificateFile}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.redirect(staticUrl);
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/verify/:certNumber', verifyCertificate);
router.get('/my-all', protect, getMyCertificates);
router.get('/my', protect, getMyCertificate);
router.get('/', protect, admin, getAllCertificates);
router.post('/', protect, admin, upload.single('certificateFile'), createCertificate);
router.put('/:id', protect, admin, upload.single('certificateFile'), updateCertificate);
router.delete('/:id', protect, admin, deleteCertificate);

module.exports = router;
