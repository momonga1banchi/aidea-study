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
checkFlowStory();

if (failures.length) {
  console.error(failures.map(x => 'FAIL R7: ' + x).join('\n'));
  process.exit(1);
}
console.log('PASS R7-details: uniqueness/F3/typecheck/materials/BUILD-NOTES/flow-story');

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
    if (text.includes('代表的な入出力を3つ')) {
      failures.push('Slide ' + idx + ' contains project-specific first-step wording');
    }
  }
  const background = findSlide(slides, 'ハーネスエンジニアリングを軽く整理すると');
  includes(background, 'Birgitta', 'background slide missing Birgitta Böckeler reference');
  includes(background, 'Guides', 'background slide missing Guides framing');
  includes(background, 'Sensors', 'background slide missing Sensors framing');
  includes(background, 'coding agent', 'background slide missing coding agent framing');
  const glossary = findSlide(slides, '先におさえる用語');
  includes(glossary, 'CR', 'glossary slide missing CR');
  includes(glossary, 'AGENTS.md', 'glossary slide missing AGENTS.md');
  includes(glossary, 'CLAUDE.md', 'glossary slide missing CLAUDE.md');
  includes(glossary, 'GEMINI.md', 'glossary slide missing GEMINI.md');
  includes(glossary, 'ADR', 'glossary slide missing ADR');

  const demo1Result = findSlide(slides, '正しく直っても');
  includes(demo1Result, 'shippingFee":500', 'Demo1 result slide missing shippingFee evidence');
  includes(demo1Result, 'message":"送料無料"', 'Demo1 result slide missing message evidence');
  const redToGreen = findSlide(slides, '古い挙動テスト');
  includes(redToGreen, 'got 500', 'red-to-green slide missing old-boundary red evidence');
  includes(redToGreen, '| policy-boundary | green |', 'red-to-green slide missing policy-boundary green table');
  includes(redToGreen, '| APIレスポンス形式 | green |', 'red-to-green slide missing API response green table');
  const demo5 = findSlide(slides, 'CR front-matter');
  includes(demo5, 'status: in_progress', 'Demo5 slide missing CR front-matter status');
  includes(demo5, 'expected_behaviors', 'Demo5 slide missing expected_behaviors');
  const demo4Guides = findSlide(slides, 'Demo 4の前に、人間が用意しておくGuides');
  includes(demo4Guides, 'order-estimate.md', 'Demo4 guides slide missing order-estimate.md');
  includes(demo4Guides, 'ADR-0001', 'Demo4 guides slide missing ADR-0001');
  includes(demo4Guides, '送料無料閾値: 3,000円', 'Demo4 guides slide missing stale spec value');
  const demo4Docs = findSlide(slides, 'リリース候補として揃ったもの');
  includes(demo4Docs, 'ADR-0002', 'Demo4 docs slide missing generated ADR excerpt');
  includes(demo4Docs, 'docs/specs/order-estimate.md', 'Demo4 docs slide missing generated spec excerpt');
  includes(demo4Docs, '残リスク', 'Demo4 docs slide missing worklog residual risk');
  const demo5Guides = findSlide(slides, 'Demo 5の前に、人間が自律ループの入口を設計する');
  includes(demo5Guides, 'CR front-matter', 'Demo5 guides slide missing CR front-matter');
  includes(demo5Guides, 'AGENTS.md ループプロトコル', 'Demo5 guides slide missing loop protocol');
  includes(demo5Guides, 'max_iterations', 'Demo5 guides slide missing max_iterations');
  const autonomy = findSlide(slides, '入口と出口に絞っても');
  includes(autonomy, 'completion-report', 'autonomy boundary slide missing completion-report');
  includes(autonomy, '入口', 'autonomy boundary slide missing human entry/exit framing');
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
    'demo-units/04_with_full_harness/instructor-materials/generated-order-estimate.md',
    'demo-units/04_with_full_harness/instructor-materials/generated-ADR-0002-free-shipping-threshold.md',
    'demo-units/04_with_full_harness/instructor-materials/generated-worklog-excerpt.md',
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

function checkFlowStory() {
  const outline = fs.readFileSync(path.join(root, 'docs/workshop/presentation-outline.md'), 'utf8');
  includes(outline, 'L0からL5', 'outline missing L0-L5 progression');
  includes(outline, '正しく直っても、テストなしでは証明できない', 'outline missing Demo 1 acceptance-gap framing');
  includes(outline, 'リリース候補', 'outline missing release-candidate framing');

  const demo1 = fs.readFileSync(path.join(root, 'demo-units/01_no_harness/instructor-notes.md'), 'utf8');
  includes(demo1, 'AIが重複まで直した場合', 'Demo 1 notes missing successful-agent branch');
  includes(demo1, 'リリース判断はできない', 'Demo 1 notes missing release-judgment landing');

  const demo2 = fs.readFileSync(path.join(root, 'demo-units/02_characterization/instructor-notes.md'), 'utf8');
  includes(demo2, 'Demo 3とDemo 4の初期状態', 'Demo 2 notes missing connection to later demos');

  const demo3 = fs.readFileSync(path.join(root, 'demo-units/03_architecture_sensor/instructor-notes.md'), 'utf8');
  includes(demo3, '振る舞いテストでは守れない', 'Demo 3 notes missing behavior-vs-structure framing');

  const demo4 = fs.readFileSync(path.join(root, 'demo-units/04_with_full_harness/instructor-notes.md'), 'utf8');
  includes(demo4, 'リリース候補としてレビュー', 'Demo 4 notes missing release-candidate review framing');

  const guide = fs.readFileSync(path.join(root, 'docs/workshop/facilitator-guide.md'), 'utf8');
  includes(guide, '何ができるようになったか', 'facilitator guide missing achieved-state checkpoint');
  includes(guide, 'それでも何が足りないか', 'facilitator guide missing remaining-gap checkpoint');

  const ppt = pptxTexts();
  const roadmap = findSlide(ppt.slideTexts, '今日のデモ全体像');
  includes(roadmap, 'L0', 'roadmap slide missing L0 level');
  includes(roadmap, 'L5', 'roadmap slide missing L5 level');
  const demo1Result = findSlide(ppt.slideTexts, '正しく直っても');
  includes(demo1Result, '正しく直っても', 'Demo 1 result slide missing new framing');
  const characterization = findSlide(ppt.slideTexts, 'characterization testは');
  includes(characterization, '書き換える', 'characterization slide missing rewrite framing');
  const demo3Slide = findSlide(ppt.slideTexts, '送料無料policyの責務境界をセンサーで止める');
  includes(demo3Slide, 'freeShippingPolicy', 'Demo 3 slide missing policy boundary artifact');
  const releaseCandidate = findSlide(ppt.slideTexts, 'リリース候補として揃ったもの');
  includes(releaseCandidate, 'リリース候補', 'release-candidate slide missing checkpoint');
  includes(releaseCandidate, 'docs/specs/order-estimate.md', 'release-candidate slide missing spec excerpt');
  includes(releaseCandidate, 'docs/decisions/ADR-0002', 'release-candidate slide missing ADR excerpt');
  const demo4GuideSlide = findSlide(ppt.slideTexts, '人間が用意しておくGuides');
  includes(demo4GuideSlide, 'CR', 'Demo 4 guides slide missing CR');
  includes(demo4GuideSlide, 'AGENTS.md', 'Demo 4 guides slide missing AGENTS.md');
  const demo5GuideSlide = findSlide(ppt.slideTexts, '自律ループの入口を設計する');
  includes(demo5GuideSlide, 'loop-state', 'Demo 5 guides slide missing loop-state');
  includes(demo5GuideSlide, 'completion-report', 'Demo 5 guides slide missing completion-report');
  const firstSteps = findSlide(ppt.slideTexts, 'まず明日からできること');
  includes(firstSteps, '影響範囲とテスト観点表', 'first-steps slide missing impact/test-viewpoint table step');
  includes(firstSteps, '固定すべき既存挙動の範囲', 'first-steps slide missing human scope decision');
  includes(firstSteps, '判断できる入口と出口', 'first-steps slide missing entry/exit framing');

  const checklist = fs.readFileSync(path.join(root, 'docs/workshop/first-steps-checklist.md'), 'utf8');
  if (checklist.includes('代表的な入出力を3つ')) failures.push('first-steps checklist still contains project-specific three examples wording');
  includes(checklist, '影響範囲、既存挙動、テスト観点、不明点', 'first-steps checklist missing viewpoint-table wording');
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
slide_names=[]
for name in z.namelist():
    m=re.match(r'ppt/slides/slide(\\d+)\\.xml$', name)
    if m:
        slide_names.append((int(m.group(1)), name))
for i,name in sorted(slide_names):
    print('---SLIDE', i)
    print(text(name))
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

function findSlide(slides, needle) {
  for (const text of Object.values(slides)) {
    if (String(text || '').includes(needle)) return text;
  }
  failures.push('PPTX slide not found: ' + needle);
  return '';
}

function normalize(text) {
  return String(text || '').replace(/\s+/g, '');
}
