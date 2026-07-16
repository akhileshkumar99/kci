const Admission = require('../models/Admission');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const nodemailer = require('nodemailer');
const generateStudentNumbers = require('../utils/generateStudentNumbers');

const getTransporter = () => nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendStudentApprovalEmail(email, name, enrollmentId, password, courseName, center, enrollmentNumber, rollNumber) {
  const portalUrl = process.env.FRONTEND_URL || 'https://kci-seven.vercel.app';
  try {
    await getTransporter().sendMail({
      from: `"Keerti Computer Institute" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Admission Approved — Your KCI Student Login Credentials',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);padding:32px;text-align:center">
            <img src="https://kci-seven.vercel.app/logo.png" alt="KCI" style="width:60px;height:60px;border-radius:12px;margin-bottom:12px" />
            <h1 style="color:#fff;margin:0;font-size:26px">🎉 Admission Approved!</h1>
            <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px">Keerti Computer Institute</p>
          </div>
          <div style="padding:32px">
            <p style="font-size:16px;color:#111">Dear <strong>${name}</strong>,</p>
            <p style="color:#374151;line-height:1.6">Welcome to <strong>Keerti Computer Institute</strong>! 🎓<br/>Your admission has been <strong style="color:#16a34a">approved</strong> by the Admin.</p>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:24px;margin:24px 0">
              <h3 style="margin:0 0 16px;color:#1d4ed8;font-size:16px">🔐 Your Login Credentials</h3>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px">Login Email</td><td style="padding:6px 0"><code style="background:#dbeafe;padding:3px 10px;border-radius:4px;font-size:14px;color:#1e40af">${email}</code></td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Temporary Password</td><td style="padding:6px 0"><code style="background:#dbeafe;padding:3px 10px;border-radius:4px;font-size:15px;font-weight:bold;color:#1e40af">${password}</code></td></tr>
                ${enrollmentNumber ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Enrollment Number</td><td style="padding:6px 0"><code style="background:#dcfce7;padding:3px 10px;border-radius:4px;font-size:14px;font-weight:bold;color:#15803d">${enrollmentNumber}</code></td></tr>` : ''}
                ${rollNumber ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Roll Number</td><td style="padding:6px 0"><code style="background:#dcfce7;padding:3px 10px;border-radius:4px;font-size:14px;color:#15803d">${rollNumber}</code></td></tr>` : ''}
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Course</td><td style="padding:6px 0;color:#374151;font-size:13px;font-weight:600">${courseName}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Center</td><td style="padding:6px 0;color:#374151;font-size:13px">${center || 'KCI'}</td></tr>
              </table>
            </div>
            <div style="text-align:center;margin:28px 0">
              <a href="${portalUrl}/login" style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">Login to Student Portal →</a>
            </div>
            <p style="color:#6b7280;font-size:13px;margin-top:20px">For help: <strong>9936384736 / 9919660880</strong></p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px">
            Keerti Computer Institute | 9936384736 / 9919660880
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('❌ Approval email FAILED:', err.message);
  }
}

async function generateEnrollmentId() {
  const count = await Admission.countDocuments({ enrollmentId: { $exists: true, $ne: null } });
  return `KCI-ENR-${String(count + 1).padStart(4, '0')}`;
}

async function logAudit(action, user, targetId, targetModel, details, ip) {
  try {
    await AuditLog.create({
      action,
      performedBy: user._id,
      performedByName: user.name,
      performedByRole: user.role,
      targetId,
      targetModel,
      details,
      ip: ip || 'unknown',
    });
  } catch (e) {
    console.error('Audit log failed:', e.message);
  }
}

exports.editAdmission = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'address', 'fatherName', 'batch', 'course', 'qualification', 'dob', 'gender', 'message', 'formNo', 'session', 'branchId'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const admission = await Admission.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('course', 'title')
      .populate('verifiedBy', 'name role')
      .populate('approvedBy', 'name role');
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });
    res.json({ success: true, admission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitAdmission = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.branchId) delete data.branchId;
    if (!data.franchise) delete data.franchise;
    data.status = 'Pending Approval';
    if (req.file) data.photo = `/uploads/${req.file.filename}`;
    const admission = await Admission.create(data);
    // Log ADMISSION_CREATED if authenticated user
    if (req.user) {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
      await logAudit('ADMISSION_CREATED', req.user, admission._id, 'Admission', { studentName: admission.name, email: admission.email }, ip);
    }
    res.status(201).json({ success: true, message: 'Admission form submitted successfully!', admission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find()
      .populate('course', 'title')
      .populate('franchise', 'name franchiseCenter franchiseCity')
      .populate('verifiedBy', 'name role')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, admissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFranchiseAdmissions = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { franchise: req.user._id };
    const admissions = await Admission.find(filter)
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, admissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Branch Manager: can verify (Pending Approval → Verified)
// Admin: can do final approval (Verified/Pending → Approved, creates student) or reject
exports.updateAdmissionStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const user = req.user;

    const admission = await Admission.findById(req.params.id)
      .populate('course', 'title')
      .populate('franchise', 'franchiseCenter franchiseCity');
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    const isAdmin = user.role === 'admin';
    const isBranchOrAdmin = user.role === 'admin' || user.role === 'branch';

    // Branch Manager can verify (Pending Approval → Verified)
    if (status === 'Verified') {
      if (!isBranchOrAdmin) return res.status(403).json({ success: false, message: 'Branch Manager or Admin required to verify' });
      admission.status = 'Verified';
      admission.verifiedBy = user._id;
      admission.verifiedAt = new Date();
      await admission.save();
      const ipV = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
      await logAudit('ADMISSION_VERIFIED', user, admission._id, 'Admission', { studentName: admission.name }, ipV);
      return res.json({ success: true, admission });
    }

    // Only Admin can do final Approved (creates student account)
    if (status === 'Approved' && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only Admin can give final approval' });
    }

    // Branch or Admin can reject
    if (status === 'Rejected' && !isBranchOrAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject' });
    }

    admission.status = status;
    if (rejectionReason) admission.rejectionReason = rejectionReason;

    if (status === 'Approved') {
      admission.approvedBy = user._id;
      admission.approvedAt = new Date();

      if (!admission.enrollmentId) {
        const enrollmentId = await generateEnrollmentId();
        admission.enrollmentId = enrollmentId;

        const existingUser = await User.findOne({ email: admission.email });
        if (!existingUser) {
          const { rollNumber, enrollmentNumber, registrationNumber } = await generateStudentNumbers();
          const password = 'KCI@' + Math.random().toString(36).slice(-6).toUpperCase();
          const courseName = admission.course?.title || '';
          const center = admission.franchise?.franchiseCenter || 'KCI';

          const student = await User.create({
            name: admission.name,
            email: admission.email,
            password,
            phone: admission.phone,
            address: admission.address,
            dob: admission.dob,
            gender: admission.gender,
            fatherName: admission.fatherName || '',
            rollNumber,
            enrollmentNumber,
            registrationNumber,
            formNo: admission.formNo,
            courseName,
            course: admission.course?._id || admission.course,
            franchiseId: admission.franchise?._id || admission.franchise,
            franchiseCenter: center,
            franchiseCity: admission.franchise?.franchiseCity,
            photo: admission.photo || '',
            role: 'student',
            isApproved: true,
            isActive: true,
            admissionDate: new Date(),
          });

          admission.studentUserId = student._id;
          await admission.save();

          await sendStudentApprovalEmail(
            admission.email, admission.name, enrollmentId, password,
            courseName, center, student.enrollmentNumber, student.rollNumber
          );

          const ipA = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
          await logAudit('ADMISSION_APPROVED', user, admission._id, 'Admission', { studentName: admission.name, enrollmentId }, ipA);
          return res.json({ success: true, admission });
        } else {
          admission.studentUserId = existingUser._id;
          await admission.save();
          await sendStudentApprovalEmail(
            admission.email, admission.name, enrollmentId, '(use your existing password)',
            existingUser.courseName || admission.course?.title || '',
            admission.franchise?.franchiseCenter || 'KCI',
            existingUser.enrollmentNumber, existingUser.rollNumber
          );
          const ipA2 = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
          await logAudit('ADMISSION_APPROVED', user, admission._id, 'Admission', { studentName: admission.name }, ipA2);
          return res.json({ success: true, admission });
        }
      }
    }

    if (status === 'Rejected') {
      const ipR = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
      await logAudit('ADMISSION_REJECTED', user, admission._id, 'Admission', { studentName: admission.name, reason: rejectionReason }, ipR);
    }

    await admission.save();
    res.json({ success: true, admission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAdmission = async (req, res) => {
  try {
    await Admission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admission deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
