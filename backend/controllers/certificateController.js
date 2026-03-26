const Certificate = require('../models/Certificate');

exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateNumber: req.params.certNumber }).populate('course', 'title');
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found or invalid' });
    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ rollNumber: req.user.rollNumber }).populate('course', 'title');
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not yet issued' });
    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find().populate('course', 'title').sort({ createdAt: -1 });
    res.json({ success: true, certificates: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCertificate = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.certificateFile = `/uploads/${req.file.filename}`;
    const cert = await Certificate.create(data);
    res.status(201).json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCertificate = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.certificateFile = `/uploads/${req.file.filename}`;
    const cert = await Certificate.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCertificate = async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
