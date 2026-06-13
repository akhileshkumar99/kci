const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const generateStudentNumbers = require('../utils/generateStudentNumbers');
const { uploadStudent } = require('../middleware/cloudinary');

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

async function sendStudentApprovalEmail(email, name, rollNumber, password, branchName, courseName) {
  try {
    await transporter.sendMail({
      from: `"Keerti Computer Institute" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎓 Your KCI Student Account is Approved!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px">🎓 Welcome to KCI!</h1>
            <p style="color:#bfdbfe;margin:8px 0 0">Your student account has been approved</p>
          </div>
          <div style="padding:32px">
            <p style="font-size:16px;color:#111">Dear <strong>${name}</strong>,</p>
            <p style="color:#374151">Your student account at <strong>${branchName}</strong> for <strong>${courseName}</strong> has been approved.</p>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0">
              <h3 style="margin:0 0 12px;color:#1d4ed8">Your Login Credentials</h3>
              <p style="margin:4px 0;color:#374151"><strong>Email:</strong> ${email}</p>
              <p style="margin:4px 0;color:#374151"><strong>Password:</strong> <code style="background:#dbeafe;padding:2px 8px;border-radius:4px;font-size:15px">${password}</code></p>
              <p style="margin:4px 0;color:#374151"><strong>Roll Number:</strong> <code style="background:#dbeafe;padding:2px 8px;border-radius:4px">${rollNumber}</code></p>
            </div>
            <p style="color:#374151">Login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="color:#1d4ed8">KCI Student Portal</a></p>
            <p style="color:#6b7280;font-size:13px">Please change your password after first login.</p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px">
            Keerti Computer Institute | 9936384736
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Student email failed:', err.message);
  }
}


const branchAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'branch' || req.user.role === 'franchise' || req.user.role === 'admin')) return next();
  res.status(403).json({ success: false, message: 'Branch access required' });
};

// Public: Get all approved branches (for admission form)
router.get('/public', async (req, res) => {
  try {
    const branches = await User.find({ role: 'branch', isApproved: true })
      .select('branchName branchCity branchCode')
      .sort('branchName');
    res.json({ success: true, branches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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
    res.json({ success: true, message: 'Branch approved and credentials sent via email', password: newPassword });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Reset any user's password (fixes plaintext password issue)
router.put('/:id/reset-password', protect, admin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || !password.trim())
      return res.status(400).json({ success: false, message: 'Password required' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    user.password = password.trim();
    await user.save(); // triggers bcrypt pre-save hook
    res.json({ success: true, message: 'Password reset successfully' });
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
    const filter = req.user.role === 'admin'
      ? { role: 'student' }
      : { role: 'student', $or: [{ branchId: req.user._id }, { franchiseId: req.user._id }] };
    const students = await User.find(filter).select('-password').populate('course', 'title').sort('-createdAt');
    res.json({ success: true, students, total: students.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Update admission status + create/update student account + send credentials email
router.put('/admissions/:id/status', protect, branchAuth, async (req, res) => {
  try {
    const Admission = require('../models/Admission');
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const admission = await Admission.findById(req.params.id).populate('course', 'title');
    if (!admission) return res.status(404).json({ success: false, message: 'Not found' });

    const wasNotApproved = admission.status !== 'Approved';
    admission.status = status;

    let studentData = null;

    if (status === 'Approved' && wasNotApproved) {
      const courseName = admission.course?.title || '';
      const branchName = req.user.branchName || 'KCI Branch';
      const existing = await User.findOne({ email: admission.email });

      if (!existing) {
        // New student — create account
        const { rollNumber, enrollmentNumber, registrationNumber, formNo } = await generateStudentNumbers();
        const plainPassword = 'KCI@' + Math.random().toString(36).slice(-6).toUpperCase();

        const created = await User.create({
          name: admission.name,
          email: admission.email,
          password: plainPassword,
          phone: admission.phone || '',
          address: admission.address || '',
          dob: admission.dob || null,
          fatherName: admission.fatherName || '',
          batch: admission.batch || '',
          rollNumber,
          enrollmentNumber,
          registrationNumber,
          formNo,
          courseName,
          course: admission.course?._id || admission.course,
          branchId: req.user._id,
          branchName: req.user.branchName,
          branchCity: req.user.branchCity,
          role: 'student',
          isApproved: true,
          isActive: true,
          admissionDate: new Date(),
        });
        admission.studentUserId = created._id;
        studentData = created.toObject();
        delete studentData.password;

        // Send credentials email
        try {
          await transporter.sendMail({
            from: `"Keerti Computer Institute" <${process.env.EMAIL_USER}>`,
            to: admission.email,
            subject: '🎉 Your KCI Admission is Approved — Login Credentials Inside!',
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);padding:32px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:26px">🎉 Admission Approved!</h1>
                <p style="color:#bfdbfe;margin:8px 0 0">Keerti Computer Institute</p>
              </div>
              <div style="padding:32px">
                <p style="font-size:16px;color:#111">Dear <strong>${admission.name}</strong>,</p>
                <p style="color:#374151">Your admission at <strong>${branchName}</strong> is approved. Your student account is ready.</p>
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0">
                  <h3 style="margin:0 0 14px;color:#1d4ed8">🔐 Login Credentials</h3>
                  <p style="margin:6px 0;color:#374151"><strong>Email:</strong> ${admission.email}</p>
                  <p style="margin:6px 0;color:#374151"><strong>Password:</strong> <code style="background:#dbeafe;padding:3px 10px;border-radius:4px;font-size:15px;font-weight:bold">${plainPassword}</code></p>
                  <p style="margin:6px 0;color:#374151"><strong>Roll Number:</strong> <code style="background:#dbeafe;padding:3px 10px;border-radius:4px;font-size:15px;font-weight:bold">${rollNumber}</code></p>
                  <p style="margin:6px 0;color:#374151"><strong>Course:</strong> ${courseName}</p>
                  <p style="margin:6px 0;color:#374151"><strong>Branch:</strong> ${branchName}</p>
                </div>
                <div style="text-align:center;margin:24px 0">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background:#1d4ed8;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">Login to Student Portal →</a>
                </div>
                <p style="color:#6b7280;font-size:13px">For help: <strong>9936384736 / 9919660880</strong></p>
              </div>
              <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px">Keerti Computer Institute | 9936384736</div>
            </div>`,
          });
        } catch (emailErr) {
          console.error('Email failed:', emailErr.message);
        }
      } else {
        // Existing student — auto-fill missing fields from admission
        const updates = {};
        if (!existing.phone && admission.phone) updates.phone = admission.phone;
        if (!existing.address && admission.address) updates.address = admission.address;
        if (!existing.dob && admission.dob) updates.dob = admission.dob;
        if (!existing.fatherName && admission.fatherName) updates.fatherName = admission.fatherName;
        if (!existing.batch && admission.batch) updates.batch = admission.batch;
        if (!existing.courseName && courseName) updates.courseName = courseName;
        if (!existing.branchId) updates.branchId = req.user._id;
        const updated = Object.keys(updates).length > 0
          ? await User.findByIdAndUpdate(existing._id, updates, { new: true }).select('-password')
          : existing;
        admission.studentUserId = existing._id;
        studentData = updated.toObject ? updated.toObject() : updated;
        delete studentData.password;
      }
    }

    await admission.save();
    res.json({ success: true, admission, newStudent: studentData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Delete admission
router.delete('/admissions/:id', protect, branchAuth, async (req, res) => {
  try {
    const Admission = require('../models/Admission');
    await Admission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admission deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Get own admissions
router.get('/admissions', protect, branchAuth, async (req, res) => {
  try {
    const Admission = require('../models/Admission');
    const filter = req.user.role === 'admin' ? {} : { branchId: req.user._id };
    const admissions = await Admission.find(filter)
      .populate('course', 'title')
      .sort('-createdAt');
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

// Branch: Add result
router.post('/results', protect, branchAuth, async (req, res) => {
  try {
    const Result = require('../models/Result');
    const result = await Result.create(req.body);
    res.status(201).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Update result
router.put('/results/:id', protect, branchAuth, async (req, res) => {
  try {
    const Result = require('../models/Result');
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Approve/toggle result
router.put('/results/:id/approve', protect, branchAuth, async (req, res) => {
  try {
    const Result = require('../models/Result');
    const isApproved = req.body.isApproved !== undefined ? req.body.isApproved : true;
    const result = await Result.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Delete result
router.delete('/results/:id', protect, branchAuth, async (req, res) => {
  try {
    const Result = require('../models/Result');
    await Result.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Result deleted' });
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

// Branch: Get next certificate number
router.get('/certificates/next-number', protect, branchAuth, async (req, res) => {
  try {
    const Certificate = require('../models/Certificate');
    const { courseName } = req.query;
    const year = new Date().getFullYear();
    // Get course abbreviation
    const courseAbbr = (() => {
      if (!courseName) return 'CERT';
      const map = {
        'Diploma in Computer Application (DCA)': 'DCA',
        'Advance Diploma in Computer Application (ADCA)': 'ADCA',
        'Certificate in Computer Application (CCA)': 'CCA',
        'Certificate In Fundamental (CIF)': 'CIF',
        'Tally Specialist Course With GST': 'TALLY',
        'Certificate In Tally A/c With GST (CIT)': 'CIT',
        'Certificate In Office Package & Tally A/C (COPT)': 'COPT',
        'Desktop Publishing (DTP)': 'DTP',
        'Computer Typing (Hindi + English)': 'TYPING',
        'Course On Computer Concept (CCC from NIELIT)': 'CCC',
      };
      return map[courseName] || courseName.match(/\(([^)]+)\)/)?.[1] || 'CERT';
    })();
    const count = await Certificate.countDocuments();
    const serial = String(count + 1).padStart(4, '0');
    const certNumber = `KCI/${year}/${courseAbbr}/${serial}`;
    res.json({ success: true, certNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Add certificate
router.post('/certificates', protect, branchAuth, async (req, res) => {
  try {
    const Certificate = require('../models/Certificate');
    const certificate = await Certificate.create(req.body);
    res.status(201).json({ success: true, certificate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Update certificate
router.put('/certificates/:id', protect, branchAuth, async (req, res) => {
  try {
    const Certificate = require('../models/Certificate');
    const certificate = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!certificate) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, certificate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Approve/toggle certificate
router.put('/certificates/:id/approve', protect, branchAuth, async (req, res) => {
  try {
    const Certificate = require('../models/Certificate');
    const isApproved = req.body.isApproved !== undefined ? req.body.isApproved : true;
    const certificate = await Certificate.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
    if (!certificate) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, certificate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Delete certificate
router.delete('/certificates/:id', protect, branchAuth, async (req, res) => {
  try {
    const Certificate = require('../models/Certificate');
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── TEST ROUTES ──────────────────────────────────────────────────────────────

// Branch: Get own tests
router.get('/tests', protect, branchAuth, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const filter = req.user.role === 'admin' ? {} : { branchId: req.user._id };
    const tests = await Test.find(filter).sort('-createdAt');
    res.json({ success: true, tests });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Branch: Create test
router.post('/tests', protect, branchAuth, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const totalMarks = (req.body.questions || []).reduce((a, q) => a + (Number(q.marks) || 1), 0);
    const test = await Test.create({ ...req.body, branchId: req.user._id, totalMarks });
    res.status(201).json({ success: true, test });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Branch: Update test
router.put('/tests/:id', protect, branchAuth, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const totalMarks = (req.body.questions || []).reduce((a, q) => a + (Number(q.marks) || 1), 0);
    const test = await Test.findByIdAndUpdate(req.params.id, { ...req.body, totalMarks }, { new: true });
    if (!test) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, test });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Branch: Delete test
router.delete('/tests/:id', protect, branchAuth, async (req, res) => {
  try {
    const Test = require('../models/Test');
    await Test.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Branch: Get test attempts
router.get('/tests/:id/attempts', protect, branchAuth, async (req, res) => {
  try {
    const TestAttempt = require('../models/TestAttempt');
    const attempts = await TestAttempt.find({ testId: req.params.id }).sort('-submittedAt');
    res.json({ success: true, attempts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Student: Get available tests for their branch
router.get('/student/tests', protect, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const TestAttempt = require('../models/TestAttempt');
    if (req.user.role !== 'student') return res.status(403).json({ success: false, message: 'Students only' });
    const branchId = req.user.branchId || req.user.franchiseId;
    if (!branchId) return res.json({ success: true, tests: [] });
    const tests = await Test.find({ branchId, isActive: true }).select('-questions.correctAnswer').sort('-createdAt');
    const attempts = await TestAttempt.find({ studentId: req.user._id }).select('testId score percentage');
    const attemptMap = {};
    attempts.forEach(a => { attemptMap[a.testId.toString()] = a; });
    const testsWithStatus = tests.map(t => ({
      ...t.toObject(),
      attempted: !!attemptMap[t._id.toString()],
      myScore: attemptMap[t._id.toString()]?.score,
      myPercentage: attemptMap[t._id.toString()]?.percentage,
    }));
    res.json({ success: true, tests: testsWithStatus });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Student: Get single test with questions (no correct answers)
router.get('/student/tests/:id', protect, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const TestAttempt = require('../models/TestAttempt');
    if (req.user.role !== 'student') return res.status(403).json({ success: false, message: 'Students only' });
    const test = await Test.findById(req.params.id).select('-questions.correctAnswer');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    const attempted = await TestAttempt.findOne({ testId: req.params.id, studentId: req.user._id });
    res.json({ success: true, test, attempted: !!attempted, attempt: attempted });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Student: Submit test
router.post('/student/tests/:id/submit', protect, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const TestAttempt = require('../models/TestAttempt');
    if (req.user.role !== 'student') return res.status(403).json({ success: false, message: 'Students only' });
    const existing = await TestAttempt.findOne({ testId: req.params.id, studentId: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already attempted' });
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    const { answers, timeTaken } = req.body;
    let score = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] !== undefined && answers[i] === q.correctAnswer) score += (q.marks || 1);
    });
    const percentage = test.totalMarks > 0 ? Math.round((score / test.totalMarks) * 100) : 0;
    const attempt = await TestAttempt.create({
      testId: test._id, studentId: req.user._id,
      rollNumber: req.user.rollNumber, studentName: req.user.name,
      answers, score, totalMarks: test.totalMarks, percentage, timeTaken,
    });
    // Return with correct answers for result display
    res.json({ success: true, attempt, correctAnswers: test.questions.map(q => q.correctAnswer) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Student: Get own attempt result
router.get('/student/tests/:id/result', protect, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const TestAttempt = require('../models/TestAttempt');
    const attempt = await TestAttempt.findOne({ testId: req.params.id, studentId: req.user._id });
    if (!attempt) return res.status(404).json({ success: false, message: 'Not attempted' });
    const test = await Test.findById(req.params.id);
    res.json({ success: true, attempt, test, correctAnswers: test.questions.map(q => q.correctAnswer) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── STUDENT ROUTES (Branch manages students) ──────────────────────────────

// Branch: Add student
router.post('/students', protect, branchAuth, uploadStudent.single('photo'), async (req, res) => {
  try {
    const { name, email, phone, fatherName, dob, address, courseName, batch, course } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const { rollNumber, enrollmentNumber, registrationNumber, formNo } = await generateStudentNumbers();
    const tempPassword = 'pending_' + Date.now();
    const student = await User.create({
      name, email, password: tempPassword, phone, fatherName, dob, address,
      courseName, batch, course, rollNumber, enrollmentNumber, registrationNumber, formNo,
      role: 'student',
      branchId: req.user._id,
      branchName: req.user.branchName,
      branchCity: req.user.branchCity,
      isApproved: false, isActive: false,
      ...(req.file && { photo: req.file.path }),
    });
    const result = student.toObject();
    delete result.password;
    res.status(201).json({ success: true, student: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Update student
router.put('/students/:id', protect, branchAuth, uploadStudent.single('photo'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (req.user.role === 'branch' && student.branchId?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });
    const updates = { ...req.body };
    delete updates.role;
    if (req.file) updates.photo = req.file.path;
    // Handle password change
    if (updates.newPassword && updates.newPassword.trim()) {
      student.password = updates.newPassword.trim();
      delete updates.newPassword;
      delete updates.password;
      Object.assign(student, updates);
      await student.save();
      const result = student.toObject();
      delete result.password;
      return res.json({ success: true, student: result });
    }
    delete updates.newPassword;
    delete updates.password;
    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json({ success: true, student: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Approve student — generate password & send email
router.put('/students/:id/approve', protect, branchAuth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (req.user.role === 'branch' && student.branchId?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });
    const newPassword = 'KCI@' + Math.random().toString(36).slice(-6).toUpperCase();
    student.isApproved = true;
    student.isActive = true;
    student.password = newPassword;
    await student.save();
    await sendStudentApprovalEmail(
      student.email, student.name, student.rollNumber, newPassword,
      req.user.branchName || 'KCI Branch', student.courseName || 'Course'
    );
    res.json({ success: true, message: 'Student approved and credentials sent via email' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Branch: Delete student
router.delete('/students/:id', protect, branchAuth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (req.user.role === 'branch' && student.branchId?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Student: Get own profile + result + certificate
router.get('/student/me', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ success: false, message: 'Student access only' });
    const Result = require('../models/Result');
    const Certificate = require('../models/Certificate');
    const student = await User.findById(req.user._id).select('-password');
    const [results, certificates] = await Promise.all([
      Result.find({ rollNumber: req.user.rollNumber, isApproved: true }).sort('-createdAt'),
      Certificate.find({ rollNumber: req.user.rollNumber, isApproved: true }).sort('-createdAt'),
    ]);
    const branch = (req.user.branchId || req.user.franchiseId)
      ? await User.findById(req.user.branchId || req.user.franchiseId).select('branchName branchCity franchiseCenter franchiseCity phone email')
      : null;
    res.json({ success: true, student, results, certificates, branch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
