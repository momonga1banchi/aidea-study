const fs = require('fs');
const path = require('path');

const targetDirs = ['src', 'tests', 'scripts'];
const errors = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && entry.name.endsWith('.js')) return [fullPath];
    return [];
  });
}

function isConsoleAllowed(file) {
  return file.endsWith('server.js') || file.endsWith(path.join('scripts', 'lint.js'));
}

for (const dir of targetDirs) {
  for (const file of walk(dir)) {
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes('\t')) errors.push(`${file}: tabs are not allowed`);
    if (/console\.log/.test(text) && !isConsoleAllowed(file)) {
      errors.push(`${file}: console.log is only allowed in server.js and scripts/lint.js`);
    }
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 120) errors.push(`${file}:${index + 1}: line is longer than 120 characters`);
    });
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('lint passed');
