const Setting = require('../models/Setting');
const ExamForm = require('../models/ExamForm');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// ── Nodemailer transporter ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ── Get admit card visibility setting (public) ──
exports.getAdmitCardSetting = async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'admitCardEnabled' });
    res.json({ success: true, enabled: s ? s.value : false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Toggle admit card visibility (admin only) ──
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

// ── Get exam schedule (public) ──
exports.getExamSchedule = async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'examSchedule' });
    res.json({ success: true, schedule: s ? s.value : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Save exam schedule (admin only) ──
exports.saveExamSchedule = async (req, res) => {
  try {
    const { examDate, examCenter, reportingTime, examType, instructions } = req.body;
    if (!examDate) return res.status(400).json({ success: false, message: 'Exam date is required' });

    const schedule = { examDate, examCenter, reportingTime, examType, instructions, updatedAt: new Date() };
    await Setting.findOneAndUpdate(
      { key: 'examSchedule' },
      { key: 'examSchedule', value: schedule },
      { upsert: true, new: true }
    );
    res.json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Send exam schedule email notification to all approved students ──
exports.sendExamNotification = async (req, res) => {
  try {
    const scheduleSetting = await Setting.findOne({ key: 'examSchedule' });
    if (!scheduleSetting?.value) {
      return res.status(400).json({ success: false, message: 'No exam schedule set. Please save a schedule first.' });
    }
    const sch = scheduleSetting.value;

    // Get all approved students with email
    const students = await User.find({ role: 'student', isApproved: true, email: { $exists: true, $ne: '' } })
      .select('name email rollNumber enrollmentNumber courseName batch');

    if (students.length === 0) {
      return res.status(400).json({ success: false, message: 'No approved students with email found.' });
    }

    const examDateFmt = sch.examDate
      ? new Date(sch.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : '-';

    let sentCount = 0;
    const errors = [];

    // Send in batches to avoid Gmail rate limits
    for (const student of students) {
      try {
        await transporter.sendMail({
          from: `"Keerti Computer Institute" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: `📋 Examination Schedule Notice — KCI | ${examDateFmt}`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(8,29,91,0.12);">

      <!-- HEADER -->
      <tr><td style="background:#081d5b;padding:28px 32px;text-align:center;">
        <img src="https://kci.org.in/logo.png" alt="KCI" width="60" style="border-radius:50%;border:2px solid #d4af37;margin-bottom:12px;" onerror="this.style.display='none'"/>
        <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0;letter-spacing:1px;">KEERTI COMPUTER INSTITUTE</h1>
        <p style="color:#b4c8f0;font-size:12px;margin:6px 0 0;">Government Recognized | ISO Certified | NIELIT Affiliated</p>
        <div style="margin-top:12px;background:#d4af37;display:inline-block;padding:6px 20px;border-radius:20px;">
          <span style="color:#081d5b;font-weight:900;font-size:13px;letter-spacing:1px;">EXAMINATION SCHEDULE NOTICE</span>
        </div>
      </td></tr>

      <!-- GREETING -->
      <tr><td style="padding:28px 32px 0;">
        <p style="color:#0a1440;font-size:16px;margin:0 0 8px;">Dear <strong>${student.name}</strong>,</p>
        <p style="color:#4a5568;font-size:14px;line-height:1.7;margin:0;">
          Your examination has been scheduled. Please find the details below and report to the exam center on time with your Admit Card and a valid photo ID.
        </p>
      </td></tr>

      <!-- EXAM DETAILS BOX -->
      <tr><td style="padding:20px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f8ff;border:2px solid #d0d8f0;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#081d5b;padding:10px 20px;">
            <span style="color:#d4af37;font-weight:900;font-size:13px;letter-spacing:1px;">📅 EXAMINATION DETAILS</span>
          </td></tr>
          ${[
            ['Exam Date',       examDateFmt],
            ['Exam Center',     sch.examCenter || '-'],
            ['Reporting Time',  sch.reportingTime || '9:00 AM'],
            ['Exam Type',       sch.examType || 'Theory'],
            ['Roll Number',     student.rollNumber || student.enrollmentNumber || '-'],
            ['Course',          student.courseName || '-'],
            ['Batch',           student.batch || '-'],
          ].map(([lbl, val], i) => `
          <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f5f8ff'};">
            <td style="padding:10px 20px;color:#5064a0;font-weight:700;font-size:13px;width:45%;">${lbl}</td>
            <td style="padding:10px 20px;color:#081d5b;font-weight:600;font-size:13px;">: ${val}</td>
          </tr>`).join('')}
        </table>
      </td></tr>

      ${sch.instructions ? `
      <!-- INSTRUCTIONS -->
      <tr><td style="padding:0 32px 20px;">
        <div style="background:#fffbeb;border:2px solid #eab308;border-radius:12px;padding:16px 20px;">
          <p style="color:#d97706;font-weight:900;font-size:13px;margin:0 0 8px;">⚠ IMPORTANT INSTRUCTIONS</p>
          <p style="color:#5c3a00;font-size:13px;line-height:1.7;margin:0;">${sch.instructions.replace(/\n/g, '<br/>')}</p>
        </div>
      </td></tr>` : ''}

      <!-- ADMIT CARD NOTICE -->
      <tr><td style="padding:0 32px 20px;">
        <div style="background:#ecfdf5;border:2px solid #6ee7b7;border-radius:12px;padding:14px 20px;text-align:center;">
          <p style="color:#065f46;font-weight:700;font-size:14px;margin:0;">
            ✅ Login to Student Portal to download your Admit Card
          </p>
          <p style="color:#047857;font-size:12px;margin:6px 0 0;">www.kci.org.in &nbsp;|&nbsp; Student Dashboard → Admit Card</p>
        </div>
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="background:#081d5b;padding:20px 32px;text-align:center;">
        <p style="color:#b4c8f0;font-size:12px;margin:0 0 4px;">Keerti Computer Institute, Ayodhya, Uttar Pradesh</p>
        <p style="color:#7090c0;font-size:11px;margin:0;">📞 9936384736 &nbsp;|&nbsp; 🌐 www.kci.org.in</p>
        <p style="color:#4060a0;font-size:10px;margin:8px 0 0;">This is a computer-generated email. Please do not reply.</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
        });
        sentCount++;
      } catch (emailErr) {
        errors.push({ email: student.email, error: emailErr.message });
      }
    }

    res.json({
      success: true,
      message: `Email sent to ${sentCount} of ${students.length} students.`,
      sentCount,
      totalStudents: students.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Fetch admit card for student (by enrollmentNumber or rollNumber) ──
exports.getAdmitCard = async (req, res) => {
  try {
    const query = req.params.enrollmentNumber;

    // Load exam schedule from settings
    const scheduleSetting = await Setting.findOne({ key: 'examSchedule' });
    const schedule = scheduleSetting?.value || {};

    // 1. Try ExamForm by enrollmentNumber (Approved)
    let form = await ExamForm.findOne({ enrollmentNumber: query, status: 'Approved' });
    if (form) {
      const serial = await ExamForm.countDocuments({ status: 'Approved', createdAt: { $lte: form.createdAt } });
      const admitCard = form.toObject();
      admitCard.serialNumber = String(serial).padStart(6, '0');
      admitCard.rollNumber = form.enrollmentNumber;
      // Merge schedule
      admitCard.examDate    = admitCard.examDate    || schedule.examDate;
      admitCard.examCenter  = admitCard.examCenter  || schedule.examCenter;
      admitCard.reportingTime = admitCard.reportingTime || schedule.reportingTime;
      admitCard.examType    = admitCard.examType    || schedule.examType;
      return res.json({ success: true, admitCard, source: 'examForm' });
    }

    // 2. Pending exam form
    const anyForm = await ExamForm.findOne({ enrollmentNumber: query });
    if (anyForm) {
      return res.status(403).json({ success: false, message: `Your exam form status is "${anyForm.status}". Only Approved forms can download admit card.` });
    }

    // 3. Student by rollNumber
    const student = await User.findOne({ rollNumber: query, role: 'student' }).select('-password');
    if (student) {
      const studentCount = await User.countDocuments({ role: 'student', createdAt: { $lte: student.createdAt } });
      const admitCard = {
        studentName:      student.name,
        fatherName:       student.fatherName || '-',
        motherName:       student.motherName || '-',
        dob:              student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-',
        gender:           student.gender || '-',
        category:         student.category || 'General',
        enrollmentNumber: student.enrollmentNumber || student.rollNumber,
        course:           student.courseName || '-',
        batch:            student.batch || '-',
        session:          student.session || '-',
        address:          student.address || '-',
        status:           'Approved',
        serialNumber:     String(studentCount).padStart(6, '0'),
        rollNumber:       student.rollNumber,
        _id:              student._id,
        // Merge schedule
        examDate:         schedule.examDate,
        examCenter:       schedule.examCenter,
        reportingTime:    schedule.reportingTime,
        examType:         schedule.examType,
      };
      return res.json({ success: true, admitCard, source: 'student' });
    }

    return res.status(404).json({ success: false, message: 'No record found.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Student portal: get own admit card ──
exports.getMyAdmitCard = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const scheduleSetting = await Setting.findOne({ key: 'examSchedule' });
    const schedule = scheduleSetting?.value || {};

    const studentCount = await User.countDocuments({ role: 'student', createdAt: { $lte: student.createdAt } });

    const admitCard = {
      studentName:      student.name,
      fatherName:       student.fatherName || '-',
      motherName:       student.motherName || '-',
      dob:              student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-',
      gender:           student.gender || '-',
      category:         student.category || 'General',
      enrollmentNumber: student.enrollmentNumber || student.rollNumber,
      courseName:       student.courseName || '-',
      batch:            student.batch || '-',
      session:          student.batch || '-',
      address:          student.address || '-',
      serialNumber:     String(studentCount).padStart(6, '0'),
      rollNumber:       student.rollNumber,
      examDate:         schedule.examDate    || null,
      examCenter:       schedule.examCenter  || null,
      reportingTime:    schedule.reportingTime || '9:00 AM',
      examType:         schedule.examType    || 'Theory',
    };

    res.json({ success: true, admitCard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
