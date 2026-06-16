const Setting  = require('../models/Setting');
const ExamForm  = require('../models/ExamForm');
const User      = require('../models/User');
const Branch    = require('../models/Branch');
const Course    = require('../models/Course');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ── Get admit card visibility setting ──
exports.getAdmitCardSetting = async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'admitCardEnabled' });
    res.json({ success: true, enabled: s ? s.value : false });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Toggle visibility ──
exports.toggleAdmitCard = async (req, res) => {
  try {
    const { enabled } = req.body;
    await Setting.findOneAndUpdate(
      { key: 'admitCardEnabled' },
      { key: 'admitCardEnabled', value: enabled },
      { upsert: true, new: true }
    );
    res.json({ success: true, enabled });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Get exam schedule ──
exports.getExamSchedule = async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'examSchedule' });
    res.json({ success: true, schedule: s ? s.value : null });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Get branches + courses for dropdowns ──
exports.getScheduleOptions = async (req, res) => {
  try {
    const [branches, courses] = await Promise.all([
      Branch.find({}, 'name city').sort('name'),
      Course.find({ isActive: true }, 'title').sort('title'),
    ]);
    res.json({ success: true, branches, courses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Save exam schedule (supports course-wise rows) ──
// Body: { examCenter, reportingTime, examType, instructions, courseSchedules: [ { course, examDate, reportingTime?, examType? } ] }
exports.saveExamSchedule = async (req, res) => {
  try {
    const { examCenter, reportingTime, examType, instructions, courseSchedules } = req.body;
    if (!courseSchedules || courseSchedules.length === 0)
      return res.status(400).json({ success: false, message: 'Add at least one course schedule row.' });

    const schedule = {
      examCenter,
      reportingTime: reportingTime || '9:00 AM',
      examType:      examType      || 'Theory',
      instructions,
      courseSchedules: courseSchedules.map(cs => ({
        course:        cs.course,
        examDate:      cs.examDate,
        reportingTime: cs.reportingTime || reportingTime || '9:00 AM',
        examType:      cs.examType      || examType      || 'Theory',
      })),
      updatedAt: new Date(),
    };

    await Setting.findOneAndUpdate(
      { key: 'examSchedule' },
      { key: 'examSchedule', value: schedule },
      { upsert: true, new: true }
    );
    res.json({ success: true, schedule });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Helper: get a student's course-wise schedule row ──
function getCourseSchedule(schedule, courseName) {
  if (!schedule || !courseName) return null;
  const rows = schedule.courseSchedules || [];
  // exact match first, then partial
  return rows.find(r => r.course?.toLowerCase() === courseName.toLowerCase())
    || rows.find(r => courseName.toLowerCase().includes(r.course?.toLowerCase()))
    || rows.find(r => r.course?.toLowerCase().includes(courseName.toLowerCase()))
    || null;
}

// ── Send email notification ──
exports.sendExamNotification = async (req, res) => {
  try {
    const scheduleSetting = await Setting.findOne({ key: 'examSchedule' });
    if (!scheduleSetting?.value)
      return res.status(400).json({ success: false, message: 'No exam schedule saved yet.' });

    const sch = scheduleSetting.value;
    const students = await User.find(
      { role: 'student', isApproved: true, email: { $exists: true, $ne: '' } },
      'name email rollNumber enrollmentNumber courseName batch'
    );
    if (!students.length)
      return res.status(400).json({ success: false, message: 'No approved students found.' });

    let sentCount = 0;
    const errors = [];

    for (const student of students) {
      try {
        // Pick course-specific row or fall back to global
        const row = getCourseSchedule(sch, student.courseName);
        const examDate      = row?.examDate      || null;
        const reportingTime = row?.reportingTime || sch.reportingTime || '9:00 AM';
        const examType      = row?.examType      || sch.examType      || 'Theory';
        const examCenter    = sch.examCenter     || '-';
        const courseName    = row?.course        || student.courseName || '-';

        const examDateFmt = examDate
          ? new Date(examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
          : 'To be announced';

        await transporter.sendMail({
          from: `"Keerti Computer Institute" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: `📋 Examination Schedule — ${courseName} | KCI`,
          html: buildEmailHTML(student, { examDateFmt, examCenter, reportingTime, examType, courseName, sch }),
        });
        sentCount++;
      } catch (e) { errors.push({ email: student.email, error: e.message }); }
    }

    res.json({ success: true, message: `Email sent to ${sentCount} of ${students.length} students.`, sentCount, totalStudents: students.length, errors: errors.length ? errors : undefined });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

function buildEmailHTML(student, { examDateFmt, examCenter, reportingTime, examType, courseName, sch }) {
  const rows = [
    ['Exam Date',       examDateFmt],
    ['Exam Center',     examCenter],
    ['Reporting Time',  reportingTime],
    ['Exam Type',       examType],
    ['Roll Number',     student.rollNumber || student.enrollmentNumber || '-'],
    ['Course',          courseName],
    ['Batch',           student.batch || '-'],
  ];
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(8,29,91,.12);">
  <tr><td style="background:#081d5b;padding:28px 32px;text-align:center;">
    <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0;">KEERTI COMPUTER INSTITUTE</h1>
    <p style="color:#b4c8f0;font-size:11px;margin:6px 0 0;">Government Recognized | ISO Certified | NIELIT Affiliated</p>
    <div style="margin-top:12px;background:#d4af37;display:inline-block;padding:5px 18px;border-radius:20px;">
      <span style="color:#081d5b;font-weight:900;font-size:12px;">EXAMINATION SCHEDULE NOTICE</span>
    </div>
  </td></tr>
  <tr><td style="padding:24px 32px 0;">
    <p style="color:#0a1440;font-size:15px;margin:0 0 6px;">Dear <strong>${student.name}</strong>,</p>
    <p style="color:#4a5568;font-size:13px;line-height:1.7;margin:0;">Your examination has been scheduled. Please find details below and report on time with your Admit Card and valid Photo ID.</p>
  </td></tr>
  <tr><td style="padding:16px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f8ff;border:2px solid #d0d8f0;border-radius:10px;overflow:hidden;">
      <tr><td style="background:#081d5b;padding:9px 18px;"><span style="color:#d4af37;font-weight:900;font-size:12px;">📅 EXAMINATION DETAILS</span></td></tr>
      ${rows.map(([l,v],i)=>`<tr style="background:${i%2===0?'#fff':'#f5f8ff'};"><td style="padding:9px 18px;color:#5064a0;font-weight:700;font-size:12px;width:42%;">${l}</td><td style="padding:9px 18px;color:#081d5b;font-weight:600;font-size:12px;">: ${v}</td></tr>`).join('')}
    </table>
  </td></tr>
  ${sch.instructions?`<tr><td style="padding:0 32px 16px;"><div style="background:#fffbeb;border:2px solid #eab308;border-radius:10px;padding:14px 18px;"><p style="color:#d97706;font-weight:900;font-size:12px;margin:0 0 6px;">⚠ IMPORTANT INSTRUCTIONS</p><p style="color:#5c3a00;font-size:12px;line-height:1.7;margin:0;">${sch.instructions.replace(/\n/g,'<br/>')}</p></div></td></tr>`:''}
  <tr><td style="padding:0 32px 20px;"><div style="background:#ecfdf5;border:2px solid #6ee7b7;border-radius:10px;padding:12px 18px;text-align:center;"><p style="color:#065f46;font-weight:700;font-size:13px;margin:0;">✅ Login to Student Portal → Admit Card tab to download your Admit Card</p></div></td></tr>
  <tr><td style="background:#081d5b;padding:18px 32px;text-align:center;">
    <p style="color:#b4c8f0;font-size:11px;margin:0;">Keerti Computer Institute, Ayodhya, U.P. | 📞 9936384736 | 🌐 www.kci.org.in</p>
    <p style="color:#4060a0;font-size:10px;margin:6px 0 0;">This is a computer-generated email. Do not reply.</p>
  </td></tr>
</table>
</td></tr>
</table></body></html>`;
}

// ── Student: get own admit card ──
exports.getMyAdmitCard = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const scheduleSetting = await Setting.findOne({ key: 'examSchedule' });
    const sch = scheduleSetting?.value || {};
    const row = getCourseSchedule(sch, student.courseName);

    const count = await User.countDocuments({ role: 'student', createdAt: { $lte: student.createdAt } });
    res.json({
      success: true,
      admitCard: {
        studentName:      student.name,
        fatherName:       student.fatherName || '-',
        motherName:       student.motherName || '-',
        dob:              student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-',
        gender:           student.gender    || '-',
        category:         student.category  || 'General',
        enrollmentNumber: student.enrollmentNumber || student.rollNumber,
        courseName:       student.courseName || '-',
        batch:            student.batch      || '-',
        session:          student.batch      || '-',
        address:          student.address    || '-',
        serialNumber:     String(count).padStart(6, '0'),
        rollNumber:       student.rollNumber,
        examDate:         row?.examDate      || null,
        examCenter:       sch.examCenter     || null,
        reportingTime:    row?.reportingTime || sch.reportingTime || '9:00 AM',
        examType:         row?.examType      || sch.examType      || 'Theory',
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Public: get admit card by enrollment/roll ──
exports.getAdmitCard = async (req, res) => {
  try {
    const query = req.params.enrollmentNumber;
    const scheduleSetting = await Setting.findOne({ key: 'examSchedule' });
    const sch = scheduleSetting?.value || {};

    let form = await ExamForm.findOne({ enrollmentNumber: query, status: 'Approved' });
    if (form) {
      const serial = await ExamForm.countDocuments({ status: 'Approved', createdAt: { $lte: form.createdAt } });
      const row = getCourseSchedule(sch, form.course || form.courseName);
      const admitCard = form.toObject();
      admitCard.serialNumber   = String(serial).padStart(6, '0');
      admitCard.rollNumber     = form.enrollmentNumber;
      admitCard.examDate       = admitCard.examDate    || row?.examDate    || null;
      admitCard.examCenter     = admitCard.examCenter  || sch.examCenter   || null;
      admitCard.reportingTime  = admitCard.reportingTime || row?.reportingTime || sch.reportingTime || '9:00 AM';
      admitCard.examType       = admitCard.examType    || row?.examType    || sch.examType      || 'Theory';
      return res.json({ success: true, admitCard, source: 'examForm' });
    }

    const anyForm = await ExamForm.findOne({ enrollmentNumber: query });
    if (anyForm) return res.status(403).json({ success: false, message: `Exam form status: "${anyForm.status}". Only Approved forms can download admit card.` });

    const student = await User.findOne({ rollNumber: query, role: 'student' }).select('-password');
    if (student) {
      const count = await User.countDocuments({ role: 'student', createdAt: { $lte: student.createdAt } });
      const row = getCourseSchedule(sch, student.courseName);
      return res.json({
        success: true,
        admitCard: {
          studentName: student.name, fatherName: student.fatherName || '-',
          motherName: student.motherName || '-',
          dob: student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-',
          gender: student.gender || '-', category: student.category || 'General',
          enrollmentNumber: student.enrollmentNumber || student.rollNumber,
          course: student.courseName || '-', batch: student.batch || '-',
          session: student.batch || '-', address: student.address || '-',
          status: 'Approved', serialNumber: String(count).padStart(6, '0'),
          rollNumber: student.rollNumber, _id: student._id,
          examDate: row?.examDate || null, examCenter: sch.examCenter || null,
          reportingTime: row?.reportingTime || sch.reportingTime || '9:00 AM',
          examType: row?.examType || sch.examType || 'Theory',
        },
        source: 'student',
      });
    }
    return res.status(404).json({ success: false, message: 'No record found.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
