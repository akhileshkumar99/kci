const Setting = require('../models/Setting');
const ExamForm = require('../models/ExamForm');
const User = require('../models/User');

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
    const query = req.params.enrollmentNumber;

    // 1. Try ExamForm by enrollmentNumber (Approved)
    let form = await ExamForm.findOne({ enrollmentNumber: query, status: 'Approved' });
    if (form) {
      // Serial number = position among all approved forms sorted by createdAt
      const serial = await ExamForm.countDocuments({ status: 'Approved', createdAt: { $lte: form.createdAt } });
      const admitCard = form.toObject();
      admitCard.serialNumber = String(serial).padStart(6, '0');
      admitCard.rollNumber = form.enrollmentNumber;
      return res.json({ success: true, admitCard, source: 'examForm' });
    }

    // 2. Try ExamForm by enrollmentNumber (any status — show pending message)
    const anyForm = await ExamForm.findOne({ enrollmentNumber: query });
    if (anyForm) {
      return res.status(403).json({ success: false, message: `Your exam form status is "${anyForm.status}". Only Approved forms can download admit card.` });
    }

    // 3. Try User by rollNumber — generate admit card from student data
    const student = await User.findOne({ rollNumber: query, role: 'student' }).select('-password');
    if (student) {
      const admitCard = {
        studentName:      student.name,
        fatherName:       student.fatherName || '—',
        motherName:       student.motherName || '—',
        dob:              student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '—',
        gender:           student.gender || '—',
        category:         student.category || 'General',
        enrollmentNumber: student.rollNumber,
        course:           student.courseName || '—',
        batch:            student.batch || '—',
        session:          student.session || '—',
        qualification:    student.qualification || '—',
        subjects:         student.subjects || '—',
        phone:            student.phone || '—',
        email:            student.email || '—',
        address:          student.address || '—',
        status:           'Approved',
      };
      // Serial from student _id last 6 chars as numeric fallback
      const studentCount = await User.countDocuments({ role: 'student', createdAt: { $lte: student.createdAt } });
      admitCard.serialNumber = String(studentCount).padStart(6, '0');
      admitCard.rollNumber = student.rollNumber;
      admitCard._id = student._id;
      return res.json({ success: true, admitCard, source: 'student' });
    }

    return res.status(404).json({ success: false, message: 'No record found for this enrollment/roll number. Please check and try again.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
