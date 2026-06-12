const User = require('../models/User');
const jwt = require('jsonwebtoken');
const generateStudentNumbers = require('../utils/generateStudentNumbers');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const { rollNumber, enrollmentNumber, registrationNumber } = await generateStudentNumbers();

    const user = await User.create({ name, email, password, phone, address, rollNumber, enrollmentNumber, registrationNumber });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password' });

    const user = await User.findOne({ email }).populate('course', 'title');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Role mismatch check
    if (role) {
      const actualRole = user.role === 'franchise' ? 'branch' : user.role;
      if (role !== actualRole)
        return res.status(401).json({ success: false, message: `Invalid credentials` });
    }

    if (!user.isApproved && user.role !== 'admin' && user.role !== 'student')
      return res.status(401).json({ success: false, message: 'Account not approved yet. Please wait for admin approval.' });

    const token = signToken(user._id);
    res.json({
      success: true, token,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role === 'franchise' ? 'branch' : user.role,
        rollNumber: user.rollNumber, enrollmentNumber: user.enrollmentNumber,
        registrationNumber: user.registrationNumber, photo: user.photo,
        courseName: user.courseName || user.course?.title || '',
        course: user.course, fatherName: user.fatherName,
        phone: user.phone, address: user.address, dob: user.dob,
        batch: user.batch, isApproved: user.isApproved, isActive: user.isActive,
        branchName: user.branchName || user.franchiseCenter,
        branchCity: user.branchCity || user.franchiseCity,
        branchCode: user.branchCode || user.franchiseCode,
        branchId: user.branchId,
        branchAddress: user.branchAddress || user.address,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('course', 'title duration');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentInfo = async (req, res) => {
  try {
    const student = await User.findOne({ rollNumber: req.params.rollNumber, role: 'student' })
      .select('name email phone rollNumber courseName batch fatherName dob address branchName branchCity isApproved');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found with this enrollment number' });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = { name: req.body.name, phone: req.body.phone, address: req.body.address };
    if (req.file) updates.photo = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
