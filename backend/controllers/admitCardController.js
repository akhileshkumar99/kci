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
