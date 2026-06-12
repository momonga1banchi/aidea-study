const { spawnSync } = require('node:child_process');
const sensors = [['test','npm',['run','test']],['lint','npm',['run','lint']],['typecheck','npm',['run','typecheck']],['architecture','npm',['run','sensor:architecture']],['schema','npm',['run','sensor:schema']],['change-package','npm',['run','sensor:change-package']]];
const rows = [];
for (const [name, cmd, args] of sensors) {
  const started = Date.now();
  const result = spawnSync(cmd, args, { encoding: 'utf8' });
  rows.push({ name, status: result.status === 0 ? 'green' : 'red', durationMs: Date.now() - started, output: [result.stdout, result.stderr].filter(Boolean).join('\n').trim() });
}
console.log('| sensor | status | durationMs |');
console.log('|---|---:|---:|');
for (const row of rows) console.log(`| ${row.name} | ${row.status} | ${row.durationMs} |`);
const warnings = rows.flatMap(row => row.output.split('\n').filter(line => /\bWARN\b/.test(line)).map(line => `[${row.name}] ${line}`));
if (warnings.length) {
  console.log('\nWarnings:');
  for (const line of warnings) console.log(line);
}
const failed = rows.filter(row => row.status !== 'green');
if (failed.length) {
  console.error('\nRed sensors:');
  for (const row of failed) console.error(`\n## ${row.name}\n${row.output}`);
  process.exit(1);
}
console.log('\nAll sensors are green.');
