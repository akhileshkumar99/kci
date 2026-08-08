const Setting = require('../models/Setting');
const ExamForm = require('../models/ExamForm');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get exam schedule (public)
exports.getExamSchedule = async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'examSchedule' });
    res.json({ success: true, schedule: s ? s.value : null });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Save exam schedule (admin)
exports.saveExamSchedule = async (req, res) => {
  try {
    const value = { ...req.body, updatedAt: new Date() };
    const s = await Setting.findOneAndUpdate({ key: 'examSchedule' }, { key: 'examSchedule', value }, { upsert: true, new: true });
    res.json({ success: true, schedule: s.value });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get schedule options — returns branches and courses for dropdowns (admin)
exports.getScheduleOptions = async (req, res) => {
  try {
    const User = require('../models/User');
    const Course = require('../models/Course');
    const [branchDocs, courseDocs] = await Promise.all([
      User.find({ role: 'branch', isApproved: true }).select('branchName branchCity').lean(),
      Course.find({ isActive: true }).select('title').lean(),
    ]);
    const branches = branchDocs.map(b => ({ _id: b._id, name: b.branchName, city: b.branchCity }));
    const courses  = courseDocs.map(c => ({ _id: c._id, title: c.title }));
    res.json({ success: true, branches, courses, options: { branches, courses } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Send exam schedule email notification to all approved students (admin)
exports.sendExamNotification = async (req, res) => {
  try {
    const nodemailer = require('nodemailer');
    const schedule = await Setting.findOne({ key: 'examSchedule' });
    if (!schedule || !schedule.value) return res.status(400).json({ success: false, message: 'No exam schedule saved. Save schedule first.' });

    const s = schedule.value;
    const students = await User.find({ role: 'student', isApproved: true }).select('name email courseName');
    if (!students.length) return res.json({ success: true, message: 'No approved students found.', sentCount: 0, totalStudents: 0 });

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 587, secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    let sentCount = 0;
    const errors = [];
    const courseMap = {};
    (s.courseSchedules || []).forEach(r => { if (r.course) courseMap[r.course.toLowerCase()] = r; });

    for (const student of students) {
      try {
        const match = courseMap[student.courseName?.toLowerCase()] || null;
        const examDate = match?.examDate ? new Date(match.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'To be announced';
        const time = match?.reportingTime || s.reportingTime || '9:00 AM';
        const type = match?.examType || s.examType || 'Theory';
        await transporter.sendMail({
          from: `"Keerti Computer Institute" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: '📋 KCI Exam Schedule — Your Admit Card Details',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);padding:28px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:22px">📋 Exam Schedule</h1>
              <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px">Keerti Computer Institute</p>
            </div>
            <div style="padding:28px">
              <p style="font-size:15px;color:#111">Dear <strong>${student.name}</strong>,</p>
              <p style="color:#374151">Your exam details are as follows:</p>
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:18px;margin:18px 0">
                <p style="margin:4px 0;color:#374151"><strong>Course:</strong> ${student.courseName || '-'}</p>
                <p style="margin:4px 0;color:#374151"><strong>Exam Date:</strong> ${examDate}</p>
                <p style="margin:4px 0;color:#374151"><strong>Reporting Time:</strong> ${time}</p>
                <p style="margin:4px 0;color:#374151"><strong>Exam Type:</strong> ${type}</p>
                <p style="margin:4px 0;color:#374151"><strong>Exam Center:</strong> ${s.examCenter || 'KCI Main Center'}</p>
              </div>
              ${s.instructions ? `<p style="color:#374151"><strong>Instructions:</strong> ${s.instructions}</p>` : ''}
              <p style="color:#374151">Login to download your Admit Card: <a href="${process.env.FRONTEND_URL || 'https://kci-seven.vercel.app'}/student-dashboard" style="color:#1d4ed8">Student Portal</a></p>
            </div>
            <div style="background:#f9fafb;padding:14px;text-align:center;color:#9ca3af;font-size:12px">Keerti Computer Institute | 9936384736</div>
          </div>`,
        });
        sentCount++;
      } catch (e) { errors.push(student.email); }
    }

    // Also create in-app notification
    await Notification.create({ title: '📋 Exam Schedule Released', message: `Exam schedule has been published. Login to view your admit card details.`, type: 'exam', targetRole: 'student', branchId: null, isActive: true, createdBy: req.user._id });

    res.json({ success: true, message: `Emails sent to ${sentCount} students.`, sentCount, totalStudents: students.length, errors });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get my admit card (student)
exports.getMyAdmitCard = async (req, res) => {
  try {
    const user = req.user;
    const normalized = (user.enrollmentNumber || user.rollNumber || user.formNo || '').toUpperCase();
    if (!normalized) return res.status(400).json({ success: false, message: 'No enrollment number found' });
    const form = await ExamForm.findOne({ enrollmentNumber: normalized, status: 'Approved' });
    if (!form) return res.status(404).json({ success: false, message: 'Admit card not available yet' });
    const serial = await ExamForm.countDocuments({ status: 'Approved', createdAt: { $lte: form.createdAt } });
    const admitCard = form.toObject();
    admitCard.serialNumber = String(serial).padStart(6, '0');
    admitCard.rollNumber = form.enrollmentNumber;
    res.json({ success: true, admitCard });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get admit card visibility setting (public)
exports.getAdmitCardSetting = async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'admitCardEnabled' });
    res.json({ success: true, enabled: s ? s.value : false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle admit card visibility (admin only)
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

// Fetch admit card — search by enrollmentNumber in ExamForm OR rollNumber in User
exports.getAdmitCard = async (req, res) => {
  try {
    const rawQuery = req.params.enrollmentNumber || req.query.query || '';
    const dobQuery = req.query.dob?.trim();
    const query = rawQuery.trim();

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide enrollment or roll number to search.' });
    }

    const normalized = query.toUpperCase();

    const isDobMatch = (recordDob, inputDob) => {
      if (!inputDob) return true;
      if (!recordDob) return false;
      const formatted = new Date(recordDob).toLocaleDateString('en-IN');
      return formatted === inputDob || recordDob === inputDob;
    };

    // 1. Try ExamForm by enrollmentNumber (Approved)
    let form = await ExamForm.findOne({ enrollmentNumber: normalized, status: 'Approved' });
    if (form) {
      if (!isDobMatch(form.dob, dobQuery)) {
        return res.status(404).json({ success: false, message: 'No record found for this enrollment/roll number and date of birth.' });
      }
      const serial = await ExamForm.countDocuments({ status: 'Approved', createdAt: { $lte: form.createdAt } });
      const admitCard = form.toObject();
      admitCard.serialNumber = String(serial).padStart(6, '0');
      admitCard.rollNumber = form.enrollmentNumber;
      return res.json({ success: true, admitCard, source: 'examForm' });
    }

    // 2. Try ExamForm by enrollmentNumber (any status — show pending message)
    const anyForm = await ExamForm.findOne({ enrollmentNumber: normalized });
    if (anyForm) {
      if (dobQuery && !isDobMatch(anyForm.dob, dobQuery)) {
        return res.status(404).json({ success: false, message: 'No record found for this enrollment/roll number and date of birth.' });
      }
      return res.status(403).json({ success: false, message: `Your exam form status is "${anyForm.status}". Only Approved forms can download admit card.` });
    }

    // 3. Try User by rollNumber — only if they have a submitted exam form
    const student = await User.findOne({ rollNumber: normalized, role: 'student' }).select('-password');
    if (student) {
      if (dobQuery && !isDobMatch(student.dob, dobQuery)) {
        return res.status(404).json({ success: false, message: 'No record found for this enrollment/roll number and date of birth.' });
      }
      // Check if student has submitted exam form
      const studentForm = await ExamForm.findOne({ enrollmentNumber: normalized });
      if (!studentForm) {
        return res.status(403).json({ success: false, message: 'Admit card is not available. Please fill and submit your Examination Form first.' });
      }
      if (studentForm.status !== 'Approved') {
        return res.status(403).json({ success: false, message: `Your exam form status is "${studentForm.status}". Admit card will be available once your form is Approved.` });
      }
    }

    return res.status(404).json({ success: false, message: 'No record found for this enrollment/roll number. Please check and try again.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
