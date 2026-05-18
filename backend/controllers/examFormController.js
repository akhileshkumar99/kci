const ExamForm = require('../models/ExamForm');

exports.submitExamForm = async (req, res) => {
  try {
    const form = await ExamForm.create(req.body);
    res.status(201).json({ success: true, message: 'Exam form submitted successfully', form });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExamForms = async (req, res) => {
  try {
    const forms = await ExamForm.find().sort({ createdAt: -1 });
    res.json({ success: true, forms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateExamFormStatus = async (req, res) => {
  try {
    const form = await ExamForm.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, form });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteExamForm = async (req, res) => {
  try {
    await ExamForm.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
