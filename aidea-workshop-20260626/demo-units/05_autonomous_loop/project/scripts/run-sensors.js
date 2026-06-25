const { spawnSync } = require('node:child_process');
const sensors = [['test','npm',['run','test']],['lint','npm',['run','lint']],['typecheck','npm',['run','typecheck']],['policy-boundary','npm',['run','sensor:architecture']],['api-response','npm',['run','sensor:api-response']],['change-package','npm',['run','sensor:change-package']]];
const forceColor = process.env.AIDEA_FORCE_COLOR === '1' || process.env.FORCE_COLOR === '1';
const colorEnabled = forceColor || (process.env.NO_COLOR !== '1' && process.env.TERM !== 'dumb');
const color = {
  bold: text => colorEnabled ? `\x1b[1m${text}\x1b[0m` : text,
  green: text => colorEnabled ? `\x1b[32m${text}\x1b[0m` : text,
  red: text => colorEnabled ? `\x1b[31m${text}\x1b[0m` : text,
  yellow: text => colorEnabled ? `\x1b[33m${text}\x1b[0m` : text,
  cyan: text => colorEnabled ? `\x1b[36m${text}\x1b[0m` : text,
};
const statusText = status => status === 'green' ? color.green('green') : color.red('red');
const rows = [];
for (const [name, cmd, args] of sensors) {
  const started = Date.now();
  const result = spawnSync(cmd, args, { encoding: 'utf8' });
  rows.push({ name, status: result.status === 0 ? 'green' : 'red', durationMs: Date.now() - started, output: [result.stdout, result.stderr].filter(Boolean).join('\n').trim() });
}
console.log(color.bold(color.cyan('Sensor results')));
console.log('| sensor | status | durationMs |');
console.log('|---|---:|---:|');
for (const row of rows) console.log(`| ${row.name} | ${statusText(row.status)} | ${row.durationMs} |`);
const warnings = rows.flatMap(row => row.output.split('\n').filter(line => /\bWARN\b/.test(line)).map(line => `[${row.name}] ${line}`));
if (warnings.length) {
  console.log(color.yellow('\nWarnings:'));
  for (const line of warnings) console.log(color.yellow(line));
}
const failed = rows.filter(row => row.status !== 'green');
if (failed.length) {
  console.error(color.red(color.bold('\nRed sensors:')));
  for (const row of failed) console.error(`\n## ${row.name}\n${row.output}`);
  console.error(color.red(color.bold(`\nSensor run failed: ${failed.length} red sensor(s).`)));
  process.exit(1);
}
console.log(color.green(color.bold('\nAll sensors are green.')));
