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
    if (text.includes('\t')) errors.push(`${file}: タブ文字は使わないでください`);
    if (/console\.log/.test(text) && !isConsoleAllowed(file)) {
      errors.push(`${file}: console.logはserver.jsとscripts/lint.jsでのみ許可されています`);
    }
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 120) errors.push(`${file}:${index + 1}: 1行が120文字を超えています`);
    });
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('lintに成功しました');
