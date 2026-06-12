const fs = require('node:fs');
const path = require('node:path');
const { collectFiles } = require('./sensor-utils');
const issues = [];
for (const file of collectFiles('docs/change-requests', f => f.endsWith('.md'))) {
  const text = fs.readFileSync(file, 'utf8');
  const fm = parseFrontMatter(text);
  if (!['in_progress', 'implemented'].includes(fm.status)) continue;
  for (const artifact of fm.required_artifacts || []) verifyArtifact(fm.id, artifact);
  for (const behavior of fm.expected_behaviors || []) verifyBehavior(fm.id, behavior);
}
if (issues.length) {
  console.error(issues.map(x => '[change-package] NG: ' + x).join('\n'));
  process.exit(1);
}
console.log('[change-package] OK: active CR contract satisfied');

function verifyArtifact(id, artifact) {
  const files = artifact.path ? [artifact.path] : glob(artifact.path_glob);
  if (!files.length || files.some(f => !fs.existsSync(f))) {
    issues.push(`${id}: required_artifacts missing ${artifact.kind}`);
    return;
  }
  for (const needle of artifact.must_include || []) {
    if (!files.some(f => fs.readFileSync(f, 'utf8').includes(needle))) issues.push(`${id}: required_artifacts ${artifact.kind} must include ${needle}`);
  }
}
function verifyBehavior(id, behavior) {
  const mod = require(path.resolve(behavior.module));
  const actual = mod[behavior.call](behavior.input);
  for (const [key, expected] of Object.entries(behavior.expect)) {
    if (actual[key] !== expected) issues.push(`${id}: expected_behaviors ${behavior.input} -> ${key}=${expected}, got ${actual[key]}`);
  }
}
function glob(pattern) {
  if (!pattern) return [];
  if (pattern === 'docs/decisions/ADR-*-free-shipping-threshold.md') return collectFiles('docs/decisions', f => /ADR-.*-free-shipping-threshold\.md$/.test(f));
  if (pattern === 'tests/**/*threshold*.test.js') return collectFiles('tests', f => /threshold.*\.test\.js$/.test(f));
  return [];
}
function parseFrontMatter(text) {
  const raw = text.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
  const obj = {};
  obj.id = raw.match(/^id:\s*(.+)$/m)?.[1].trim();
  obj.status = raw.match(/^status:\s*(.+)$/m)?.[1].trim();
  obj.acceptance = (raw.match(/^acceptance:\s*\[(.*)\]/m)?.[1] || '').split(',').map(s => s.trim()).filter(Boolean);
  obj.expected_behaviors = Array.from(raw.matchAll(/- \{ module: "([^"]+)", call: "([^"]+)", input: (\d+), expect: \{ ([^:]+): (\d+) \} \}/g)).map(m => ({ module: m[1], call: m[2], input: Number(m[3]), expect: { [m[4].trim()]: Number(m[5]) } }));
  obj.required_artifacts = [];
  for (const m of raw.matchAll(/- \{ kind: (\w+),\s+(path|path_glob): "([^"]+)"(?:, must_include: \[([^\]]+)\])? \}/g)) {
    obj.required_artifacts.push({ kind: m[1], [m[2]]: m[3], must_include: m[4] ? Array.from(m[4].matchAll(/"([^"]+)"/g)).map(x => x[1]) : [] });
  }
  return obj;
}
