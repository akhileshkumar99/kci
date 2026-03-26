const User = require('../models/User');
const Course = require('../models/Course');
const Admission = require('../models/Admission');
const Result = require('../models/Result');
const Certificate = require('../models/Certificate');
const Contact = require('../models/Contact');

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
    const { name, email, password, phone, batch, courseName } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const count = await User.countDocuments({ role: 'student' });
    const rollNumber = `KCI${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
    const student = await User.create({ name, email, password, phone, batch, courseName, rollNumber, role: 'student', ...(photo && { photo }) });
    res.status(201).json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).populate('course', 'title').sort({ createdAt: -1 });
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const updates = { name: req.body.name, email: req.body.email, phone: req.body.phone, batch: req.body.batch, courseName: req.body.courseName };
    if (req.file) updates.photo = `/uploads/${req.file.filename}`;
    const student = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json({ success: true, student });
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
