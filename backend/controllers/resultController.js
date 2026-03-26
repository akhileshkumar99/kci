const Result = require('../models/Result');
const User = require('../models/User');

exports.getResultByRoll = async (req, res) => {
  try {
    const result = await Result.findOne({ rollNumber: req.params.rollNumber }).populate('course', 'title');
    if (!result) return res.status(404).json({ success: false, message: 'No result found for this roll number' });
    const student = await User.findOne({ rollNumber: req.params.rollNumber }).select('photo');
    const resultObj = result.toObject();
    if (student?.photo) resultObj.studentPhoto = student.photo;
    res.json({ success: true, result: resultObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyResult = async (req, res) => {
  try {
    const result = await Result.findOne({ rollNumber: req.user.rollNumber }).populate('course', 'title');
    if (!result) return res.status(404).json({ success: false, message: 'Result not yet published' });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find().populate('course', 'title').sort({ createdAt: -1 });
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createResult = async (req, res) => {
  try {
    const data = req.body;
    if (data.subjects && Array.isArray(data.subjects)) {
      const obtained = data.subjects.reduce((s, sub) => s + Number(sub.obtainedMarks), 0);
      const total = data.subjects.reduce((s, sub) => s + Number(sub.maxMarks), 0);
      data.obtainedMarks = obtained;
      data.totalMarks = total;
      data.percentage = ((obtained / total) * 100).toFixed(2);
      data.grade = data.percentage >= 90 ? 'A+' : data.percentage >= 75 ? 'A' : data.percentage >= 60 ? 'B' : data.percentage >= 45 ? 'C' : 'D';
      data.status = data.percentage >= 40 ? 'Pass' : 'Fail';
    }
    const result = await Result.create(data);
    res.status(201).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const update = { studentName: req.body.studentName };
    if (req.file) update.resultFile = req.file.filename;
    const result = await Result.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Result deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
