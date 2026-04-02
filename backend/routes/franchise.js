const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// Register franchise
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, franchiseCenter, franchiseCity } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const franchiseCode = 'KCI-F-' + Date.now().toString().slice(-6);
    const user = await User.create({ name, email, password, phone, franchiseCenter, franchiseCity, franchiseCode, role: 'franchise', isApproved: false });
    res.status(201).json({ success: true, message: 'Franchise registration submitted. Awaiting admin approval.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all franchises (admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const franchises = await User.find({ role: 'franchise' }).select('-password');
    res.json({ success: true, franchises });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve franchise
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ success: true, message: 'Franchise approved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Franchise dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const students = await User.find({ role: 'student' }).countDocuments();
    res.json({ success: true, stats: { students } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
