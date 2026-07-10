const fs = require('fs');

const fixes = [
  // Broken arrow/unicode sequences
  [/â†'/g, '←'],
  [/â†/g, '→'],
  [/â"€/g, '─'],
  // Broken checkmarks / cross
  [/âœ"/g, '✓'],
  [/âœ—/g, '✗'],
  [/âŒ/g, ''],
  // Broken em/en dash
  [/â€"/g, '—'],
  [/â€"/g, '–'],
  // Broken quotes
  [/â€˜/g, '\u2018'],
  [/â€™/g, '\u2019'],
  [/â€œ/g, '\u201C'],
  [/â€/g, '\u201D'],
  // Broken bullet / misc
  [/â€¢/g, '•'],
  [/Â /g, ' '],
  [/â³/g, '⏳'],
  // Leftover broken sequences
  [/â[^\s]/g, ''],
];

const files = [
  'c:\\Users\\DELL\\OneDrive\\Desktop\\kci\\frontend\\src\\pages\\StudentDashboard.jsx',
  'c:\\Users\\DELL\\OneDrive\\Desktop\\kci\\frontend\\src\\pages\\QuizPage.jsx',
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  fixes.forEach(([pat, rep]) => { c = c.replace(pat, rep); });
  fs.writeFileSync(f, c, 'utf8');
  console.log('Fixed:', f);
});
