const Certificate = require('../models/Certificate');
const Setting = require('../models/Setting');
const Notification = require('../models/Notification');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

async function notifyStudent(enrollmentNumber, formNo, rollNumber, studentId, title, message) {
  try {
    let student = null;
    if (studentId) student = await User.findById(studentId).select('branchId franchiseId');
    if (!student && enrollmentNumber) student = await User.findOne({ enrollmentNumber }).select('branchId franchiseId');
    if (!student && formNo) student = await User.findOne({ formNo }).select('branchId franchiseId');
    if (!student && rollNumber) student = await User.findOne({ rollNumber }).select('branchId franchiseId');
    await Notification.create({
      title, message, type: 'result',
      targetRole: 'student',
      branchId: student?.branchId || student?.franchiseId || null,
      isActive: true,
    });
  } catch (_) {}
}

const makeTemplateHandlers = (key) => ({
  get: async (req, res) => {
    try {
      const s = await Setting.findOne({ key });
      res.json({ success: true, templateUrl: s ? s.value : null });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  },
  upload: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const url = `/uploads/${req.file.filename}`;
      await Setting.findOneAndUpdate({ key }, { key, value: url }, { upsert: true, new: true });
      res.json({ success: true, templateUrl: url });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  },
});

const certTpl = makeTemplateHandlers('certificateTemplate');
const idCardTpl = makeTemplateHandlers('idCardTemplate');

exports.getTemplate = certTpl.get;
exports.uploadTemplate = certTpl.upload;
exports.getIdCardTemplate = idCardTpl.get;
exports.uploadIdCardTemplate = idCardTpl.upload;

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
    // Search by enrollmentNumber, formNo, or rollNumber
    const cert = await Certificate.findOne({
      $or: [
        { enrollmentNumber: req.user.enrollmentNumber },
        { formNo: req.user.formNo },
        { rollNumber: req.user.rollNumber },
        { student: req.user._id },
      ].filter(c => Object.values(c)[0]),
    }).populate('course', 'title');
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not yet issued. Please contact the institute administration.' });
    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyCertificates = async (req, res) => {
  try {
    const orConditions = [];
    if (req.user.enrollmentNumber) orConditions.push({ enrollmentNumber: req.user.enrollmentNumber });
    if (req.user.formNo) orConditions.push({ formNo: req.user.formNo });
    if (req.user.rollNumber) orConditions.push({ rollNumber: req.user.rollNumber });
    orConditions.push({ student: req.user._id });
    const certs = await Certificate.find({ $or: orConditions }).populate('course', 'title').sort({ createdAt: -1 });
    res.json({ success: true, certificates: certs });
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
    // Auto-notify student
    await notifyStudent(
      cert.enrollmentNumber, cert.formNo, cert.rollNumber, cert.student,
      '🏅 Certificate Uploaded',
      `Your certificate for ${cert.courseName} has been uploaded. You can now view and download it from your Student Dashboard.`
    );
    // Audit log
    if (req.user) {
      try {
        const AuditLog = require('../models/AuditLog');
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
        await AuditLog.create({
          action: 'CERTIFICATE_GENERATED',
          performedBy: req.user._id,
          performedByName: req.user.name,
          performedByRole: req.user.role,
          targetId: cert._id,
          targetModel: 'Certificate',
          details: { studentName: cert.studentName, enrollmentNumber: cert.enrollmentNumber, formNo: cert.formNo, courseName: cert.courseName },
          ip,
        });
      } catch {}
    }
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
