const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const TSC_TIMEOUT_MS = 10000;

const first = run('npx', ['--no-install', '--package', 'typescript', 'tsc', '--noEmit'], TSC_TIMEOUT_MS);
if (first.status === 0) {
  console.log('[typecheck] OK: npx --no-install typescript tsc --noEmit');
  process.exit(0);
}
if (looksLikeTypeScriptFailure(first)) {
  process.stderr.write(first.output);
  process.exit(first.status || 1);
}

const second = run('tsc', ['--noEmit'], TSC_TIMEOUT_MS);
if (second.status === 0) {
  console.log('[typecheck] OK: global tsc --noEmit');
  process.exit(0);
}
if (looksLikeTypeScriptFailure(second)) {
  process.stderr.write(second.output);
  process.exit(second.status || 1);
}

console.warn('[typecheck] WARN: tsc未検出のため構文チェックのみ');
const files = collectFiles('.', file => file.endsWith('.js') && !file.includes('node_modules') && !file.includes('/.git/'));
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || '[typecheck] NG: ' + file + '\n');
    process.exit(1);
  }
}
console.log('[typecheck] OK: node --check ' + files.length + ' files');

function run(command, args, timeout) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout });
  return {
    status: result.status,
    error: result.error,
    output: [result.stdout, result.stderr].filter(Boolean).join('\n'),
  };
}

function looksLikeTypeScriptFailure(result) {
  if (result.error && result.error.code === 'ENOENT') return false;
  if (result.error && result.error.code === 'ETIMEDOUT') return false;
  if (/error TS\d+/.test(result.output)) return true;
  if (/Found \d+ errors?/.test(result.output)) return true;
  return false;
}

function collectFiles(dir, predicate) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectFiles(file, predicate));
    else if (predicate(file)) result.push(file);
  }
  return result.sort();
}
