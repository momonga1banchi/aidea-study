const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = process.argv[2] || process.cwd();
const failures = [];

checkUniqueness();
checkPptxText();
checkTypecheckEffectiveness();
checkMaterials();
checkBuildNotes();

if (failures.length) {
  console.error(failures.map(x => 'FAIL R7: ' + x).join('\n'));
  process.exit(1);
}
console.log('PASS R7-details: uniqueness/F3/typecheck/materials/BUILD-NOTES');

function checkUniqueness() {
  const guide = fs.readFileSync(path.join(root, 'docs/workshop/facilitator-guide.md'), 'utf8');
  const sayLines = Array.from(guide.matchAll(/#### 言うこと\n\n([\s\S]*?)(?=\n#### |\n### |\n## |$)/g)).map(m => normalize(m[1]));
  duplicateGuard('facilitator-guide 言うこと', sayLines);
  const notes = ['01_no_harness','02_characterization','03_architecture_sensor','04_with_full_harness','05_autonomous_loop'].map(unit => normalize(fs.readFileSync(path.join(root, 'demo-units', unit, 'instructor-notes.md'), 'utf8')));
  duplicateGuard('instructor-notes', notes);
  const ppt = pptxTexts();
  if (ppt.notesText.includes('このスライドでは')) failures.push('speaker notes contain banned template phrase');
  duplicateGuard('pptx speaker notes', ppt.notesTexts.map(normalize));
  duplicateSentenceGuard('pptx speaker notes sentence', ppt.notesTexts);
}

function checkPptxText() {
  const ppt = pptxTexts();
  const slides = ppt.slideTexts;
  for (const [idx, text] of Object.entries(slides)) {
    if (/黒箱|水増し|captured from|プレースホルダ|レンダリング|採取した/.test(text)) {
      failures.push('Slide ' + idx + ' contains production vocabulary');
    }
  }
  includes(slides[13], 'shippingFee":500', 'Slide 13 missing Demo1 shippingFee evidence');
  includes(slides[13], 'message":"送料無料"', 'Slide 13 missing Demo1 message evidence');
  includes(slides[19], 'got 0', 'Slide 19 missing red test got 0 evidence');
  includes(slides[19], '| architecture | green |', 'Slide 19 missing green sensors table');
  includes(slides[22], 'status: in_progress', 'Slide 22 missing CR front-matter status');
  includes(slides[22], 'expected_behaviors', 'Slide 22 missing expected_behaviors');
  includes(slides[23], 'completion-report', 'Slide 23 missing completion-report');
  includes(slides[23], 'Demo1', 'Slide 23 missing intervention comparison');
}

function checkTypecheckEffectiveness() {
  const tmp = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'aidea-typecheck-'));
  fs.cpSync(path.join(root, 'demo-units/03_architecture_sensor/project'), path.join(tmp, 'project'), { recursive: true });
  fs.appendFileSync(path.join(tmp, 'project/src/services/promotionService.js'), '\n/** @type {string} */ const injectedTypeError = 1;\n');
  const result = spawnSync('npm', ['run', 'typecheck'], { cwd: path.join(tmp, 'project'), encoding: 'utf8', timeout: 10000 });
  const out = [result.stdout, result.stderr].filter(Boolean).join('\n');
  if (result.status === 0 && !out.includes('[typecheck] WARN: tsc未検出のため構文チェックのみ')) {
    failures.push('typecheck injection stayed green without WARN fallback');
  }
}

function checkMaterials() {
  const required = [
    'demo-units/01_no_harness/instructor-materials/contradiction-curl.txt',
    'demo-units/01_no_harness/instructor-materials/session-log.txt',
    'demo-units/02_characterization/instructor-materials/test-run-output.txt',
    'demo-units/03_architecture_sensor/instructor-materials/red-output.txt',
    'demo-units/04_with_full_harness/instructor-materials/red-to-green.txt',
    'demo-units/05_autonomous_loop/instructor-materials/full-session-log.txt',
    'demo-units/05_autonomous_loop/instructor-materials/completion-report.md',
    'demo-units/05_autonomous_loop/instructor-materials/loop-state.md',
  ];
  for (const rel of required) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) failures.push('missing material: ' + rel);
    else if (fs.readFileSync(file, 'utf8').trim().length < 80) failures.push('material too short: ' + rel);
  }
}

function checkBuildNotes() {
  const text = fs.readFileSync(path.join(root, 'BUILD-NOTES.md'), 'utf8');
  for (const needle of ['R1 typecheck', 'R2 実物素材', 'R3 PPTX', 'R4 facilitator-guide', 'R5 リハーサル', 'R6 instructor-notes', 'R7 verify-kit', 'M1/M2 採取記録', 'C1 Demo 2', 'C2 Demo 4', 'C3 Demo 5']) {
    includes(text, needle, 'BUILD-NOTES missing ' + needle);
  }
  if (/### C1 Demo 1/.test(text)) failures.push('BUILD-NOTES still labels Demo 1 as C1');
  includes(text, '反復回数: 3', 'BUILD-NOTES C3 iteration count does not match completion-report');
  includes(text, 'C1は手動相当で代替', 'BUILD-NOTES missing C1 manual-equivalent disclosure');
}

function pptxTexts() {
  const pptx = path.join(root, 'outputs/aidea-workshop-20260626.pptx');
  const py = `
import html, re, sys, zipfile
p=sys.argv[1]
z=zipfile.ZipFile(p)
def text(name):
    raw=z.read(name).decode('utf-8', 'ignore')
    raw=re.sub(r'<[^>]+>', '', raw)
    return html.unescape(raw)
for i in range(1,29):
    name=f'ppt/slides/slide{i}.xml'
    print('---SLIDE', i)
    print(text(name) if name in z.namelist() else '')
print('---NOTES')
for name in sorted([n for n in z.namelist() if n.startswith('ppt/notesSlides/notesSlide') and n.endswith('.xml')]):
    print('---NOTE', name)
    print(text(name))
`;
  const result = spawnSync('python3', ['-', pptx], { input: py, encoding: 'utf8' });
  if (result.status !== 0) failures.push('failed to extract pptx text: ' + result.stderr);
  const out = result.stdout || '';
  const slideTexts = {};
  for (const part of out.split('---SLIDE ').slice(1)) {
    const idx = Number(part.match(/^(\d+)/)?.[1]);
    slideTexts[idx] = part.replace(/^\d+\n/, '');
  }
  const notesTexts = out.split('---NOTE ').slice(1).map(x => x.replace(/^.*?\n/, ''));
  return { slideTexts, notesTexts, notesText: notesTexts.join('\n') };
}

function duplicateGuard(label, values) {
  const counts = new Map();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) || 0) + 1);
  for (const [value, count] of counts.entries()) {
    if (count >= 3) failures.push(label + ' duplicate phrase appears ' + count + ' times: ' + value.slice(0, 80));
  }
}

function duplicateSentenceGuard(label, values) {
  const counts = new Map();
  for (const value of values) {
    for (const sentence of String(value || '').split(/[。．.!！？?\n]+/)) {
      const normalized = normalize(sentence);
      if (normalized.length > 10) counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }
  }
  for (const [value, count] of counts.entries()) {
    if (count >= 3) failures.push(label + ' appears ' + count + ' times: ' + value.slice(0, 80));
  }
}

function includes(haystack, needle, message) {
  if (!String(haystack || '').includes(needle)) failures.push(message);
}

function normalize(text) {
  return String(text || '').replace(/\s+/g, '');
}
