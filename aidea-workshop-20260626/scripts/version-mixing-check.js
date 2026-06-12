const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2] || process.cwd();
const pattern = /v(8|9|1[0-9])([^0-9]|$)|前回の(試行|資料|バージョン)|前バージョン|改善点/;
const hits = [];
walk(root);
if (hits.length) {
  console.error(hits.join('\n'));
  process.exit(1);
}
console.log('version wording check ok');
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'runs') continue;
      walk(file);
    } else if (/\.(md|js|json|yml|yaml|txt|ps1|sh|xml)$/.test(entry.name)) {
      if (entry.name === 'version-mixing-check.js') continue;
      const text = fs.readFileSync(file, 'utf8');
      if (pattern.test(text)) hits.push(file);
    }
  }
}
