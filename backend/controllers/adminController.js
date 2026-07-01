const User = require('../models/User');
const Course = require('../models/Course');
const Admission = require('../models/Admission');
const Result = require('../models/Result');
const Certificate = require('../models/Certificate');
const Contact = require('../models/Contact');
const generateStudentNumbers = require('../utils/generateStudentNumbers');
const { deleteFromCloudinary } = require('../middleware/cloudinary');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendApprovalEmail(student) {
  try {
    await transporter.sendMail({
      from: `"Keerti Computer Institute" <${process.env.EMAIL_USER}>`,
      to: student.email,
      subject: '✅ Your KCI Account is Approved!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);padding:32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px">Account Approved!</h1>
            <p style="color:#bfdbfe;margin:8px 0 0">Keerti Computer Institute</p>
          </div>
          <div style="padding:32px">
            <p style="font-size:16px;color:#111">Dear <strong>${student.name}</strong>,</p>
            <p style="color:#374151">Your student account has been approved. You can now login to the student portal.</p>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0">
              <h3 style="margin:0 0 12px;color:#1d4ed8">Your Login Details</h3>
              <p style="margin:6px 0;color:#374151"><strong>Email:</strong> ${student.email}</p>
              <p style="margin:6px 0;color:#374151"><strong>Roll Number:</strong> <code style="background:#dbeafe;padding:2px 10px;border-radius:4px;font-size:15px;font-weight:bold">${student.rollNumber}</code></p>
              <p style="margin:6px 0;color:#374151"><strong>Enrollment No:</strong> ${student.enrollmentNumber || '-'}</p>
              <p style="margin:6px 0;color:#374151"><strong>Course:</strong> ${student.courseName || '-'}</p>
            </div>
            <p style="color:#374151">Login at: <a href="${process.env.FRONTEND_URL || 'https://kci-seven.vercel.app'}/login" style="color:#1d4ed8;font-weight:bold">KCI Student Portal</a></p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px">
            Keerti Computer Institute | 9936384736
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Approval email failed:', err.message);
  }
}

const monthlyAgg = (Model, field = 'createdAt') => Model.aggregate([
  { $group: { _id: { month: { $month: `$${field}` }, year: { $year: `$${field}` } }, count: { $sum: 1 } } },
  { $sort: { '_id.year': 1, '_id.month': 1 } },
  { $limit: 6 },
]);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

exports.getDashboardStats = async (req, res) => {
  try {
    const [students, courses, admissions, results, certificates, unreadContacts,
      admissionMonthly, resultMonthly, courseCategories] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments({ isActive: true }),
      Admission.countDocuments(),
      Result.countDocuments(),
      Certificate.countDocuments(),
      Contact.countDocuments({ isRead: false }),
      monthlyAgg(Admission),
      monthlyAgg(Result),
      Course.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    const toChartData = (agg) => agg.map(d => ({ name: MONTHS[d._id.month - 1], count: d.count }));

    res.json({
      success: true,
      stats: { students, courses, admissions, results, certificates, unreadContacts },
      charts: {
        admissions: toChartData(admissionMonthly),
        results: toChartData(resultMonthly),
        courseCategories: courseCategories.map(d => ({ name: d._id || 'Other', value: d.count })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, batch, courseName, fatherName, dob, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const { rollNumber, enrollmentNumber, registrationNumber, formNo } = await generateStudentNumbers();
    const photo = req.file ? req.file.path : undefined;
    const student = await User.create({ name, email, password, phone, batch, courseName, fatherName, dob, address, rollNumber, enrollmentNumber, registrationNumber, formNo, role: 'student', ...(req.body.branchId && { branchId: req.body.branchId }), ...(photo && { photo }) });
    res.status(201).json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .populate('course', 'title')
      .populate('branchId', 'branchName branchCode branchCity name')
      .sort({ createdAt: -1 });
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'batch', 'courseName', 'fatherName', 'dob', 'address', 'admissionDate', 'branchId'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const prevStudent = await User.findById(req.params.id).select('isApproved email');
    const beingApproved = (req.body.isApproved === 'true' || req.body.isApproved === true) && !prevStudent?.isApproved;

    if (req.body.isApproved !== undefined) updates.isApproved = req.body.isApproved === 'true' || req.body.isApproved === true;
    if (req.file) updates.photo = req.file.path;
    if (req.body.password && req.body.password.trim()) {
      const bcrypt = require('bcryptjs');
      updates.password = await bcrypt.hash(req.body.password.trim(), 10);
    }
    const student = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: false }).select('-password');

    // Send approval email only when isApproved changes false -> true
    if (beingApproved && student?.email) {
      await sendApprovalEmail(student);
    }

    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBranchUsers = async (req, res) => {
  try {
    const branches = await User.find({ role: 'branch' }).select('name branchName branchCode branchCity').sort({ branchName: 1 });
    res.json({ success: true, branches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
