const Result = require('../models/Result');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

async function logAudit(action, user, targetId, details, ip) {
  try {
    await AuditLog.create({
      action,
      performedBy: user._id,
      performedByName: user.name,
      performedByRole: user.role,
      targetId,
      targetModel: 'Result',
      details,
      ip: ip || 'unknown',
    });
  } catch (e) {}
}

// Lookup student by formNo or enrollmentNumber and return their details
exports.lookupStudent = async (req, res) => {
  try {
    const { formNo, enrollmentNumber } = req.query;
    if (!formNo && !enrollmentNumber) return res.status(400).json({ success: false, message: 'Provide formNo or enrollmentNumber' });

    const query = {};
    if (formNo) query.formNo = formNo;
    else if (enrollmentNumber) query.enrollmentNumber = enrollmentNumber;

    const student = await User.findOne({ role: 'student', ...query })
      .populate('course', 'title')
      .populate('branchId', 'branchName branchCode branchCity')
      .select('name fatherName courseName course batch branchId branchName rollNumber enrollmentNumber formNo');

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({
      success: true,
      student: {
        name: student.name,
        fatherName: student.fatherName || '',
        courseName: student.courseName || student.course?.title || '',
        batch: student.batch || '',
        branch: student.branchId?.branchName || student.branchName || '',
        rollNumber: student.rollNumber || '',
        enrollmentNumber: student.enrollmentNumber || '',
        formNo: student.formNo || '',
        studentId: student._id,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getResultByRoll = async (req, res) => {
  try {
    const result = await Result.findOne({ rollNumber: req.params.rollNumber }).populate('course', 'title');
    if (!result) return res.status(404).json({ success: false, message: 'No result found for this roll number' });
    const student = await User.findOne({ rollNumber: req.params.rollNumber }).select('photo fatherName phone branchName');
    const resultObj = result.toObject();
    if (student?.photo)      resultObj.studentPhoto = student.photo;
    if (student?.fatherName) resultObj.fatherName   = student.fatherName;
    if (student?.phone)      resultObj.phone        = student.phone;
    if (student?.branchName) resultObj.branchName   = student.branchName;
    res.json({ success: true, result: resultObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyResult = async (req, res) => {
  try {
    const result = await Result.findOne({
      $or: [
        { rollNumber: req.user.rollNumber },
        { enrollmentNumber: req.user.enrollmentNumber },
        { formNo: req.user.formNo },
      ],
    }).populate('course', 'title');
    if (!result) return res.status(404).json({ success: false, message: 'Result not yet published' });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllResults = async (req, res) => {
  try {
    let resultFilter = {};
    // Branch managers only see results for their own students
    if (req.user.role === 'branch') {
      const branchStudents = await User.find({ role: 'student', branchId: req.user._id }).select('rollNumber enrollmentNumber formNo');
      const rollNos = branchStudents.map(s => s.rollNumber).filter(Boolean);
      const enrollNos = branchStudents.map(s => s.enrollmentNumber).filter(Boolean);
      const formNos = branchStudents.map(s => s.formNo).filter(Boolean);
      const orClauses = [
        ...(rollNos.length ? [{ rollNumber: { $in: rollNos } }] : []),
        ...(enrollNos.length ? [{ enrollmentNumber: { $in: enrollNos } }] : []),
        ...(formNos.length ? [{ formNo: { $in: formNos } }] : []),
      ];
      if (!orClauses.length) return res.json({ success: true, results: [] });
      resultFilter = { $or: orClauses };
    }
    const results = await Result.find(resultFilter).populate('course', 'title').sort({ createdAt: -1 });
    const rollNumbers = results.map(r => r.rollNumber).filter(Boolean);
    const students = await User.find({ rollNumber: { $in: rollNumbers } }).select('rollNumber branchName branchId').populate('branchId', 'branchName');
    const branchMap = {};
    students.forEach(s => { branchMap[s.rollNumber] = s.branchId?.branchName || s.branchName || null; });
    const enriched = results.map(r => ({ ...r.toObject(), branchName: branchMap[r.rollNumber] || r.branch || null }));
    res.json({ success: true, results: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createResult = async (req, res) => {
  try {
    const data = { ...req.body };

    // Duplicate check — prevent duplicate result for same formNo or enrollmentNumber
    if (data.formNo || data.enrollmentNumber) {
      const dupQuery = [];
      if (data.formNo) dupQuery.push({ formNo: data.formNo });
      if (data.enrollmentNumber) dupQuery.push({ enrollmentNumber: data.enrollmentNumber });
      const existing = await Result.findOne({ $or: dupQuery });
      if (existing) return res.status(400).json({ success: false, message: `Result already exists for this student (${existing.studentName}). Use Edit to update.` });
    }

    // Auto-calculate marks if subjects provided
    if (data.subjects && Array.isArray(data.subjects)) {
      const obtained = data.subjects.reduce((s, sub) => s + Number(sub.obtainedMarks || 0), 0);
      const total = data.subjects.reduce((s, sub) => s + Number(sub.maxMarks || 0), 0);
      data.obtainedMarks = obtained;
      data.totalMarks = total;
      data.percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : 0;
      data.grade = data.percentage >= 90 ? 'A+' : data.percentage >= 75 ? 'A' : data.percentage >= 60 ? 'B' : data.percentage >= 45 ? 'C' : 'D';
      data.status = data.percentage >= 40 ? 'Pass' : 'Fail';
    }

    // If formNo or enrollmentNumber provided, auto-fetch student details
    if (data.formNo || data.enrollmentNumber) {
      const query = data.formNo ? { formNo: data.formNo } : { enrollmentNumber: data.enrollmentNumber };
      const student = await User.findOne({ role: 'student', ...query })
        .populate('branchId', 'branchName')
        .select('name fatherName courseName batch branchId branchName rollNumber enrollmentNumber formNo');
      if (student) {
        data.studentName = data.studentName || student.name;
        data.fatherName = data.fatherName || student.fatherName;
        data.courseName = data.courseName || student.courseName;
        data.batch = data.batch || student.batch;
        data.branch = data.branch || student.branchId?.branchName || student.branchName;
        data.rollNumber = data.rollNumber || student.rollNumber;
        data.enrollmentNumber = data.enrollmentNumber || student.enrollmentNumber;
        data.formNo = data.formNo || student.formNo;
        data.student = student._id;
      }
    }

    if (data.uploadDate) data.uploadDate = new Date(data.uploadDate);

    const result = await Result.create(data);

    if (req.user) {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
      await logAudit('RESULT_UPLOADED', req.user, result._id, { studentName: result.studentName, formNo: result.formNo }, ip);
    }

    res.status(201).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.resultFile = req.file.filename;

    // Recalculate marks if subjects provided
    if (data.subjects && Array.isArray(data.subjects)) {
      const obtained = data.subjects.reduce((s, sub) => s + Number(sub.obtainedMarks || 0), 0);
      const total = data.subjects.reduce((s, sub) => s + Number(sub.maxMarks || 0), 0);
      data.obtainedMarks = obtained;
      data.totalMarks = total;
      data.percentage = total > 0 ? parseFloat(((obtained / total) * 100).toFixed(2)) : 0;
      data.grade = data.percentage >= 90 ? 'A+' : data.percentage >= 75 ? 'A' : data.percentage >= 60 ? 'B' : data.percentage >= 45 ? 'C' : 'D';
      data.status = data.percentage >= 40 ? 'Pass' : 'Fail';
    }
    if (data.uploadDate) data.uploadDate = new Date(data.uploadDate);
    if (data.examDate) data.examDate = new Date(data.examDate);

    const result = await Result.findByIdAndUpdate(req.params.id, data, { new: true });
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (req.user && result) await logAudit('RESULT_UPDATED', req.user, result._id, { studentName: result.studentName, formNo: result.formNo }, ip);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (req.user && result) await logAudit('RESULT_DELETED', req.user, result._id, { studentName: result.studentName }, ip);
    res.json({ success: true, message: 'Result deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
