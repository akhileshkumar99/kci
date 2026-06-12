const User = require('../models/User');

const generateStudentNumbers = async () => {
  const count = await User.countDocuments({ role: 'student' });
  const year = new Date().getFullYear();
  const center = '01';
  const serial = String(count + 1).padStart(4, '0');
  const rollNumber = `${year}${center}${serial}`;
  return {
    rollNumber,
    enrollmentNumber: `KCI/ENR/${year}/${serial}`,
    registrationNumber: `KCI/REG/${year}/${serial}`,
  };
};

module.exports = generateStudentNumbers;
