const fs = require('node:fs');
const path = require('node:path');

function collectFiles(dir, predicate = () => true) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectFiles(file, predicate));
    else if (predicate(file)) result.push(file);
  }
  return result.sort();
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function shapeOf(value) {
  if (Array.isArray(value)) return ['array', value.length ? shapeOf(value[0]) : 'unknown'];
  if (value === null) return 'null';
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, shapeOf(child)]));
  }
  return typeof value;
}

module.exports = { collectFiles, readJson, shapeOf };
