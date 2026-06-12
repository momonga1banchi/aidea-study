const fs = require('node:fs');
const path = require('node:path');
const { collectFiles, readJson } = require('./sensor-utils');
const allowlist = readJson('scripts/architecture-allowlist.json');
const issues = [];

for (const file of collectFiles('src/controllers', f => f.endsWith('.js'))) {
  const text = fs.readFileSync(file, 'utf8');
  for (const req of Array.from(text.matchAll(/require\(['"]([^'"]+)['"]\)/g))) {
    const target = resolveRequire(file, req[1]);
    if (target && (target.includes('/repositories/') || target.includes('/config/'))) {
      issues.push(`[architecture] NG: ${file}: controllersからrepositories/configへのrequireは禁止`);
    }
  }
  for (const literal of Array.from(text.matchAll(/\b(\d{3,})\b/g))) {
    if (['200', '400', '404', '500'].includes(literal[1])) continue;
    issues.push(`[architecture] NG: ${file}: 数値リテラル ${literal[1]} (業務閾値はsrc/config/pricing.jsへ)`);
  }
  if (/(subtotal|price|threshold).*[<>]=?/.test(text)) {
    issues.push(`[architecture] NG: ${file}: 金額比較ロジックはcontrollersに置かない`);
  }
}

for (const file of collectFiles('src/services', f => f.endsWith('.js'))) {
  const text = fs.readFileSync(file, 'utf8');
  if (/node:http/.test(text) || /controllers\//.test(text)) {
    issues.push(`[architecture] NG: ${file}: servicesからcontrollers/node:httpへの依存は禁止`);
  }
}

for (const file of collectFiles('src', f => f.endsWith('.js'))) {
  if (file.includes('/config/')) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const match of Array.from(text.matchAll(/(?:threshold|FREE_SHIPPING[^=]*)\s*=\s*(\d{3,})/gi))) {
    if (!allowlist.duplicateThresholdDefinitions.includes(file)) {
      issues.push(`[architecture] NG: ${file}: FREE_SHIPPING系の数値定義はsrc/configだけに置く`);
    }
  }
}

if (issues.length) {
  console.error(issues.join('\n'));
  process.exit(1);
}
console.log('[architecture] OK: dependency direction and pricing boundaries');

function resolveRequire(from, spec) {
  if (!spec.startsWith('.')) return null;
  return path.normalize(path.join(path.dirname(from), spec)) + '.js';
}
