const fs = require('fs');

// Read as binary buffer
let c = fs.readFileSync('frontend/src/pages/StudentDashboard.jsx', 'utf8');

// The garbled text is latin1-misread UTF-8. Re-encode each:
// Each "ðŸXX" pattern = original emoji bytes read as latin1
// Fix: replace the garbled latin1 string with correct emoji

function fixLatin1Emoji(str) {
  // Convert garbled latin1-encoded UTF-8 back to proper string
  try {
    const bytes = Buffer.from(str, 'latin1');
    return bytes.toString('utf8');
  } catch(e) {
    return str;
  }
}

// Find all garbled emoji patterns (start with 0xC3 0xB0 = "ð" in latin1 misread)
// Replace them by re-encoding as latin1 -> utf8
const result = c.replace(/[\xC3][\xB0][\xC5-\xC9\xE2][\x80-\xBF][\x80-\xBF]|[\xC3][\xB0][\xC5-\xC9\xE2][\x80-\xBF]/g, (match) => {
  return fixLatin1Emoji(match);
});

// Also handle the specific patterns we see
let fixed = c;

// Use Buffer trick: encode garbled string as latin1, decode as utf8
const garbledPatterns = [
  'ð\x9F\x91\xA4',  // 👤
  'ð\x9F\x91\xA8',  // 👨  
  'ð\x9F\x93\xA7',  // 📧
  'ð\x9F\x93\xB1',  // 📱
  'ð\x9F\x8D\x8D',  // 📍
  'ð\x9F\x93\x8B',  // 📋
  'ð\x9F\x93\x9A',  // 📚
  'ð\x9F\x93\x85',  // 📅
  'ð\x9F\x93\x86',  // 📆
  'ð\x9F\x93\x8A',  // 📊
  'ð\x9F\x8F\xA2',  // 🏢
  'ð\x9F\x93\x9E',  // 📞
  'ð\x9F\x8E\xAB',  // 🎫
  'ð\x9F\x8E\x82',  // 🎂
  '\xE2\x9C\x85',   // ✅
  '\xE2\x9C\x93',   // ✓
  '\xE2\x8F\xB3',   // ⏳
];

garbledPatterns.forEach(pattern => {
  const buf = Buffer.from(pattern, 'binary');
  const correct = buf.toString('utf8');
  const garbled = buf.toString('latin1');
  if (garbled !== correct) {
    fixed = fixed.split(garbled).join(correct);
  }
});

fs.writeFileSync('frontend/src/pages/StudentDashboard.jsx', fixed, 'utf8');
console.log('Fixed! Remaining garbled:', (fixed.match(/\xF0|\xC3\xB0/g)||[]).length);
