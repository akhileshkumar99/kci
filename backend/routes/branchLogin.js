const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { protect, admin } = require('../middleware/auth');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendApprovalEmail(email, name, branchName, branchCode, password) {
  try {
    await transporter.sendMail({
      from: `"Keerti Computer Institute" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Your KCI Branch Application is Approved!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);padding:32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px">🎉 Branch Approved!</h1>
            <p style="color:#bfdbfe;margin:8px 0 0">Keerti Computer Institute</p>
          </div>
          <div style="padding:32px">
            <p style="font-size:16px;color:#111">Dear <strong>${name}</strong>,</p>
            <p style="color:#374151">Congratulations! Your branch application for <strong>${branchName}</strong> has been approved by KCI Admin.</p>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0">
              <h3 style="margin:0 0 12px;color:#1d4ed8">Your Login Credentials</h3>
              <p style="margin:4px 0;color:#374151"><strong>Email:</strong> ${email}</p>
              <p style="margin:4px 0;color:#374151"><strong>Password:</strong> <code style="background:#dbeafe;padding:2px 8px;border-radius:4px;font-size:15px">${password}</code></p>
              <p style="margin:4px 0;color:#374151"><strong>Branch Code:</strong> <code style="background:#dbeafe;padding:2px 8px;border-radius:4px">${branchCode}</code></p>
            </div>
            <p style="color:#374151">Login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="color:#1d4ed8">KCI Portal</a></p>
            <p style="color:#6b7280;font-size:13px">Please change your password after first login.</p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px">
            Keerti Computer Institute | 9936384736
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

const branchAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'branch' || req.user.role === 'admin')) return next();
  res.status(403).json({ success: false, message: 'Branch access required' });
};

// Public: Apply for branch
router.post('/apply', async (req, res) => {
  try {
    const { name, email, phone, branchName, branchCity, branchAddress } = req.body;
    if (!name || !email || !branchName || !branchCity)
      return res.status(400).json({ success: false, message: 'Fill all required fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const branchCode = 'KCI-B-' + Date.now().toString().slice(-6);
    await User.create({
      name, email, password: 'pending_' + Date.now(), phone,
      branchName, branchCity, branchAddress, branchCode,
      role: 'branch', isApproved: false,
    });
    res.status(201).json({ success: true, message: 'Branch application submitted. Awaiting admin approval.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all branches
router.get('/', protect, admin, async (req, res) => {
  try {
    const branches = await User.find({ role: 'branch' }).select('-password').sort('-createdAt');
    res.json({ success: true, branches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create branch directly
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, email, password, phone, branchName, branchCity, branchAddress, notes, isApproved } = req.body;
    if (!name || !email || !branchName || !branchCity)
      return res.status(400).json({ success: false, message: 'Fill all required fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const branchCode = 'KCI-B-' + Date.now().toString().slice(-6);
    const plainPass = password || 'kci123456';
    const branch = await User.create({
      name, email, password: plainPass, phone,
      branchName, branchCity, branchAddress, branchCode, notes,
      role: 'branch', isApproved: isApproved ?? true,
    });
    if (branch.isApproved) {
      await sendApprovalEmail(email, name, branchName, branchCode, plainPass);
    }
    const result = branch.toObject();
    delete result.password;
    res.status(201).json({ success: true, branch: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update branch
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.role;
    if (updates.password && updates.password.trim()) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'Not found' });
      user.password = updates.password.trim();
      delete updates.password;
      Object.assign(user, updates);
      await user.save();
      const result = user.toObject();
      delete result.password;
      return res.json({ success: true, branch: result });
    }
    delete updates.password;
    const branch = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!branch) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, branch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Approve branch — generate password & send email
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const branch = await User.findById(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Not found' });
    const newPassword = 'KCI@' + Math.random().toString(36).slice(-6).toUpperCase();
    branch.isApproved = true;
    branch.password = newPassword;
    await branch.save();
    await sendApprovalEmail(branch.email, branch.name, branch.branchName, branch.branchCode, newPassword);
    res.json({ success: true, message: 'Branch approved and credentials sent via email' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete branch
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Branch deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Dashboard stats
router.get('/dashboard-stats', protect, branchAuth, async (req, res) => {
  try {
    const Result = require('../models/Result');
    const Certificate = require('../models/Certificate');
    const Admission = require('../models/Admission');
    const Course = require('../models/Course');
    const students = await User.countDocuments({ role: 'student', branchId: req.user._id });
    const active = await User.countDocuments({ role: 'student', branchId: req.user._id, isActive: true });
    const admissions = await Admission.countDocuments({ branchId: req.user._id });
    const courses = await Course.countDocuments({ isActive: true });
    const studentDocs = await User.find({ role: 'student', branchId: req.user._id }).select('rollNumber');
    const rollNumbers = studentDocs.map(s => s.rollNumber).filter(Boolean);
    const results = await Result.countDocuments({ rollNumber: { $in: rollNumbers } });
    const certificates = await Certificate.countDocuments({ rollNumber: { $in: rollNumbers } });
    res.json({ success: true, stats: { students, active, admissions, courses, results, certificates } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Get own students
router.get('/students', protect, branchAuth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? { role: 'student' } : { role: 'student', branchId: req.user._id };
    const students = await User.find(filter).select('-password').populate('course', 'title').sort('-createdAt');
    res.json({ success: true, students, total: students.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Get own admissions
router.get('/admissions', protect, branchAuth, async (req, res) => {
  try {
    const Admission = require('../models/Admission');
    const filter = req.user.role === 'admin' ? {} : { branchId: req.user._id };
    const admissions = await Admission.find(filter).sort('-createdAt');
    res.json({ success: true, admissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Get own results
router.get('/results', protect, branchAuth, async (req, res) => {
  try {
    const Result = require('../models/Result');
    const students = await User.find({ role: 'student', branchId: req.user._id }).select('rollNumber');
    const rollNumbers = students.map(s => s.rollNumber).filter(Boolean);
    const results = await Result.find({ rollNumber: { $in: rollNumbers } }).sort('-createdAt');
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Get own certificates
router.get('/certificates', protect, branchAuth, async (req, res) => {
  try {
    const Certificate = require('../models/Certificate');
    const students = await User.find({ role: 'student', branchId: req.user._id }).select('rollNumber');
    const rollNumbers = students.map(s => s.rollNumber).filter(Boolean);
    const certificates = await Certificate.find({ rollNumber: { $in: rollNumbers } }).sort('-createdAt');
    res.json({ success: true, certificates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
