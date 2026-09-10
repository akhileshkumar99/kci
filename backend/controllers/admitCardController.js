const crypto = require('crypto');
const Setting = require('../models/Setting');
const ExamForm = require('../models/ExamForm');
const User = require('../models/User');
const Course = require('../models/Course');
const Branch = require('../models/Branch');

// Helper to generate secure random verification token
const generateToken = () => {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
};

// 1. Get Admit Card Visibility Setting (Public)
exports.getAdmitCardSetting = async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'admitCardEnabled' });
    res.json({ success: true, enabled: s ? s.value : false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Toggle Admit Card Visibility (Admin Only)
exports.toggleAdmitCard = async (req, res) => {
  try {
    const { enabled } = req.body;
    await Setting.findOneAndUpdate(
      { key: 'admitCardEnabled' },
      { key: 'admitCardEnabled', value: enabled },
      { upsert: true, new: true }
    );
    res.json({ success: true, enabled });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Get Exam Schedule Setting (Public)
exports.getExamSchedule = async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'examSchedule' });
    res.json({ success: true, schedule: s ? s.value : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Save Exam Schedule (Admin Only)
exports.saveExamSchedule = async (req, res) => {
  try {
    const scheduleData = req.body;
    const s = await Setting.findOneAndUpdate(
      { key: 'examSchedule' },
      { key: 'examSchedule', value: scheduleData },
      { upsert: true, new: true }
    );
    res.json({ success: true, schedule: s.value });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Get Branches & Courses Options for Admin Schedule Form
exports.getScheduleOptions = async (req, res) => {
  try {
    const branches = await Branch.find().select('name city address').sort({ name: 1 });
    const courses = await Course.find({ isActive: true }).select('title').sort({ title: 1 });
    res.json({
      success: true,
      branches: branches.map(b => `${b.name}, ${b.city}`),
      courses: courses.map(c => c.title),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Secure QR Token Verification Endpoint (Public)
// URL: /api/admit-card/verify/:token
exports.verifyAdmitCardToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ 
        verified: false, 
        message: '✕ INVALID ADMIT CARD. Missing verification token.' 
      });
    }

    // Search ExamForm by verificationToken
    let form = await ExamForm.findOne({ verificationToken: token, status: 'Approved' });
    
    if (!form) {
      // Fallback: search by enrollmentNumber if token matches enrollment
      form = await ExamForm.findOne({ enrollmentNumber: token.toUpperCase(), status: 'Approved' });
    }

    if (!form) {
      return res.status(404).json({
        verified: false,
        message: '✕ INVALID ADMIT CARD. This Admit Card could not be verified in the KCI Central Examination Database.'
      });
    }

    // Get Schedule Settings for Center & Date overrides
    const scheduleSetting = await Setting.findOne({ key: 'examSchedule' });
    const sched = scheduleSetting ? scheduleSetting.value : null;

    let examDate = form.examDate || '';
    let reportingTime = form.reportingTime || '9:15 AM';
    let examType = form.examType || 'Regular';

    if (sched) {
      if (sched.courseSchedules?.length) {
        const match = sched.courseSchedules.find(c => 
          c.course?.toLowerCase() === form.course?.toLowerCase()
        );
        if (match) {
          if (match.examDate) examDate = match.examDate;
          if (match.reportingTime) reportingTime = match.reportingTime;
          if (match.examType) examType = match.examType;
        }
      }
      if (!reportingTime) reportingTime = sched.reportingTime || '9:15 AM';
      if (!examType) examType = sched.examType || 'Regular';
    }

    const examCenter = form.examCenter || sched?.examCenter || 'Keerti Computer Institute, Main Campus';

    // Format clean response data for verified Admit Card
    return res.json({
      verified: true,
      status: 'VALID',
      admitCard: {
        studentName: form.studentName,
        rollNumber: form.enrollmentNumber,
        enrollmentNumber: form.enrollmentNumber,
        formNumber: form.formNo || `KCI-FORM-${form._id.toString().slice(-6).toUpperCase()}`,
        courseName: form.course,
        examType: examType,
        examDate: examDate,
        examCenter: examCenter,
        reportingTime: reportingTime,
        session: form.session || form.batch || '2026',
        studentPhoto: form.studentPhoto || null,
        serialNumber: form.admitCardSerial || form._id.toString().slice(-6).toUpperCase(),
        issueDate: form.updatedAt ? new Date(form.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
        verificationTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      }
    });
  } catch (err) {
    res.status(500).json({ verified: false, message: 'Server verification error' });
  }
};

// 7. Get Current Logged-in Student Admit Card (Student Portal)
exports.getMyAdmitCard = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const rollQuery = user.rollNumber || user.enrollmentNumber || user.email;
    let form = await ExamForm.findOne({
      $or: [
        { userId: user._id },
        { enrollmentNumber: rollQuery }
      ],
      status: 'Approved'
    });

    if (!form) {
      return res.json({ success: true, admitCard: null });
    }

    // Auto-generate verificationToken if missing
    if (!form.verificationToken) {
      form.verificationToken = generateToken();
      await form.save();
    }

    const serial = await ExamForm.countDocuments({ status: 'Approved', createdAt: { $lte: form.createdAt } });
    const admitCard = form.toObject();
    admitCard.serialNumber = String(serial).padStart(6, '0');
    admitCard.rollNumber = form.enrollmentNumber || user.rollNumber;
    admitCard.formNumber = form.formNo || `KCI-FORM-${form._id.toString().slice(-6).toUpperCase()}`;

    // Get Exam Schedule
    const scheduleSetting = await Setting.findOne({ key: 'examSchedule' });
    const sched = scheduleSetting ? scheduleSetting.value : null;
    admitCard.schedule = sched;

    return res.json({ success: true, admitCard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Admin Endpoint: Search Admit Card
exports.getAdmitCard = async (req, res) => {
  try {
    const rawQuery = req.params.enrollmentNumber || req.query.query || '';
    const query = rawQuery.trim().toUpperCase();

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide enrollment or roll number to search.' });
    }

    let form = await ExamForm.findOne({ enrollmentNumber: query, status: 'Approved' });
    if (!form) {
      return res.status(404).json({ success: false, message: 'No approved admit card found for this enrollment number.' });
    }

    if (!form.verificationToken) {
      form.verificationToken = generateToken();
      await form.save();
    }

    const serial = await ExamForm.countDocuments({ status: 'Approved', createdAt: { $lte: form.createdAt } });
    const admitCard = form.toObject();
    admitCard.serialNumber = String(serial).padStart(6, '0');
    admitCard.rollNumber = form.enrollmentNumber;

    return res.json({ success: true, admitCard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 9. Admin Endpoint: Regenerate Verification Token
exports.regenerateToken = async (req, res) => {
  try {
    const { formId } = req.body;
    let form = await ExamForm.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Exam form not found' });
    }
    form.verificationToken = generateToken();
    await form.save();
    res.json({ success: true, verificationToken: form.verificationToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
