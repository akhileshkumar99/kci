const Admission = require('../models/Admission');
const User = require('../models/User');
const Course = require('../models/Course');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendStudentApprovalEmail(email, name, enrollmentId, password, courseName, franchiseCenter) {
  try {
    await transporter.sendMail({
      from: `"Keerti Computer Institute" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Your KCI Admission is Approved!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);padding:32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px">🎉 Admission Approved!</h1>
            <p style="color:#bfdbfe;margin:8px 0 0">Keerti Computer Institute</p>
          </div>
          <div style="padding:32px">
            <p style="font-size:16px;color:#111">Dear <strong>${name}</strong>,</p>
            <p style="color:#374151">Congratulations! Your admission at <strong>${franchiseCenter || 'KCI'}</strong> has been approved.</p>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0">
              <h3 style="margin:0 0 12px;color:#1d4ed8">Your Login Credentials</h3>
              <p style="margin:6px 0;color:#374151"><strong>Enrollment ID:</strong> <code style="background:#dbeafe;padding:2px 10px;border-radius:4px;font-size:15px;font-weight:bold">${enrollmentId}</code></p>
              <p style="margin:6px 0;color:#374151"><strong>Email:</strong> ${email}</p>
              <p style="margin:6px 0;color:#374151"><strong>Password:</strong> <code style="background:#dbeafe;padding:2px 10px;border-radius:4px;font-size:15px">${password}</code></p>
              <p style="margin:6px 0;color:#374151"><strong>Course:</strong> ${courseName}</p>
            </div>
            <p style="color:#374151">Login at: <a href="http://localhost:5173/login" style="color:#1d4ed8;font-weight:bold">KCI Student Portal</a></p>
            <p style="color:#6b7280;font-size:13px">Please change your password after first login.</p>
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
    const admission = await Admission.create(req.body);
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
        const count = await User.countDocuments({ role: 'student' });
        const rollNumber = `KCI${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
        const password = rollNumber; // plain, will be hashed by pre-save
        const courseName = admission.course?.title || '';

        const student = await User.create({
          name: admission.name,
          email: admission.email,
          password,
          phone: admission.phone,
          address: admission.address,
          dob: admission.dob,
          gender: admission.gender,
          rollNumber,
          courseName,
          course: admission.course?._id || admission.course,
          franchiseId: admission.franchise?._id || admission.franchise,
          franchiseCenter: admission.franchise?.franchiseCenter,
          franchiseCity: admission.franchise?.franchiseCity,
          role: 'student',
          isActive: true,
          admissionDate: new Date(),
        });

        admission.studentUserId = student._id;

        // Send email with credentials
        await sendStudentApprovalEmail(
          admission.email,
          admission.name,
          enrollmentId,
          rollNumber, // plain password before hashing
          courseName,
          admission.franchise?.franchiseCenter || 'KCI'
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
