const fs = require('node:fs');
const { collectFiles } = require('./sensor-utils');
const files = collectFiles('.', file => file.endsWith('.js') && !file.includes('node_modules'));
const issues = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  text.split('\n').forEach((line, index) => {
    if (line.includes('\t')) issues.push(`${file}:${index + 1} tab character`);
    if (/\s+$/.test(line)) issues.push(`${file}:${index + 1} trailing whitespace`);
  });
  if (!file.startsWith('scripts/') && /console\.log\s*\(/.test(text)) issues.push(`${file}: console.log is not allowed outside scripts`);
  if (/\bvar\s+/.test(text)) issues.push(`${file}: legacy variable keyword is not allowed`);
}
if (issues.length) {
  console.error(issues.join('\n'));
  process.exit(1);
}
console.log(`[lint] OK: ${files.length} files`);
