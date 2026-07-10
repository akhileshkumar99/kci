const Admission = require('../models/Admission');
const User = require('../models/User');
const Course = require('../models/Course');
const nodemailer = require('nodemailer');
const generateStudentNumbers = require('../utils/generateStudentNumbers');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendStudentApprovalEmail(email, name, enrollmentId, password, courseName, franchiseCenter, enrollmentNumber, rollNumber) {
  const portalUrl = process.env.FRONTEND_URL || 'https://kci-seven.vercel.app';
  try {
    await transporter.sendMail({
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
            <p style="color:#374151;line-height:1.6">Welcome to <strong>Keerti Computer Institute</strong>! 🎓<br/>Your admission at <strong>${franchiseCenter || 'KCI'}</strong> has been <strong style="color:#16a34a">approved</strong>. Your student account is now active.</p>

            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:24px;margin:24px 0">
              <h3 style="margin:0 0 16px;color:#1d4ed8;font-size:16px">🔐 Your Login Credentials</h3>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px">Login Email</td><td style="padding:6px 0"><code style="background:#dbeafe;padding:3px 10px;border-radius:4px;font-size:14px;color:#1e40af">${email}</code></td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Temporary Password</td><td style="padding:6px 0"><code style="background:#dbeafe;padding:3px 10px;border-radius:4px;font-size:15px;font-weight:bold;color:#1e40af">${password}</code></td></tr>
                ${enrollmentNumber ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Enrollment Number</td><td style="padding:6px 0"><code style="background:#dcfce7;padding:3px 10px;border-radius:4px;font-size:14px;font-weight:bold;color:#15803d">${enrollmentNumber}</code></td></tr>` : ''}
                ${rollNumber ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Roll Number</td><td style="padding:6px 0"><code style="background:#dcfce7;padding:3px 10px;border-radius:4px;font-size:14px;color:#15803d">${rollNumber}</code></td></tr>` : ''}
                ${enrollmentId ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Enrollment ID</td><td style="padding:6px 0"><code style="background:#dcfce7;padding:3px 10px;border-radius:4px;font-size:14px;color:#15803d">${enrollmentId}</code></td></tr>` : ''}
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Course</td><td style="padding:6px 0;color:#374151;font-size:13px;font-weight:600">${courseName}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Center</td><td style="padding:6px 0;color:#374151;font-size:13px">${franchiseCenter || 'KCI'}</td></tr>
              </table>
            </div>

            <div style="text-align:center;margin:28px 0">
              <a href="${portalUrl}/login" style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">Login to Student Portal →</a>
            </div>

            <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-top:8px">
              <p style="margin:0;color:#92400e;font-size:13px">⚠️ <strong>Important:</strong> Please change your password after your first login for security. Go to your dashboard → Profile → Change Password.</p>
            </div>

            <p style="color:#6b7280;font-size:13px;margin-top:20px">For help or queries, contact us at: <strong>9936384736 / 9919660880</strong></p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px">
            Keerti Computer Institute | 9936384736 / 9919660880
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Student approval email failed:', err.message);
  }
}

// Generate serial enrollment ID: KCI-ENR-0001, KCI-ENR-0002 ...
async function generateEnrollmentId() {
  const count = await Admission.countDocuments({ enrollmentId: { $exists: true, $ne: null } });
  return `KCI-ENR-${String(count + 1).padStart(4, '0')}`;
}

exports.submitAdmission = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.branchId) delete data.branchId;
    if (!data.franchise) delete data.franchise;
    const admission = await Admission.create(data);
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
      .sort({ createdAt: -1 });
    res.json({ success: true, admissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Franchise: get only their admissions
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

exports.updateAdmissionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const admission = await Admission.findById(req.params.id).populate('course', 'title').populate('franchise', 'franchiseCenter franchiseCity');
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    admission.status = status;

    if (status === 'Approved' && !admission.enrollmentId) {
      // Generate enrollment ID
      const enrollmentId = await generateEnrollmentId();
      admission.enrollmentId = enrollmentId;

      // Auto-generate student account
      const existingUser = await User.findOne({ email: admission.email });
      if (!existingUser) {
        const { rollNumber, enrollmentNumber, registrationNumber } = await generateStudentNumbers();
        const password = rollNumber;
        const courseName = admission.course?.title || '';

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
          courseName,
          course: admission.course?._id || admission.course,
          franchiseId: admission.franchise?._id || admission.franchise,
          franchiseCenter: admission.franchise?.franchiseCenter,
          franchiseCity: admission.franchise?.franchiseCity,
          role: 'student',
          isApproved: true,
          isActive: true,
          admissionDate: new Date(),
        });

        admission.studentUserId = student._id;

        // Send email with credentials
        await sendStudentApprovalEmail(
          admission.email, admission.name, enrollmentId, password,
          courseName, admission.franchise?.franchiseCenter || 'KCI',
          student.enrollmentNumber, student.rollNumber
        );
      } else {
        admission.studentUserId = existingUser._id;
        await sendStudentApprovalEmail(
          admission.email, admission.name, enrollmentId,
          '(use your existing password)',
          existingUser.courseName || admission.course?.title || '',
          admission.franchise?.franchiseCenter || 'KCI',
          existingUser.enrollmentNumber, existingUser.rollNumber
        );
      }
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
