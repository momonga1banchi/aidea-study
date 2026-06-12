const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const pptx = path.join(root, 'outputs', 'aidea-workshop-20260626.pptx');
const backup = path.join(root, 'outputs', 'aidea-workshop-20260626.before-09-fix.pptx');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aidea-pptx-09-'));

if (!fs.existsSync(pptx)) throw new Error('missing pptx: ' + pptx);
if (!fs.existsSync(backup)) fs.copyFileSync(pptx, backup);

run('unzip', ['-q', pptx, '-d', tmp]);

const leakedInstruction = '実際に採取したログの特徴行を表示。黒箱は内容量に合わせて高さを変え、空白で水増ししない。';
const captions = {
  13: '小計6,000円で送料500円なのにメッセージは「送料無料」。片方の閾値だけが変わった。',
  14: '境界値4999/5000と不変条件を、現在の挙動のまま固定した。',
  16: 'テストは全部緑。でも構造のセンサーだけが赤を出している。',
  19: 'Demo 1で人間がcurlで見つけた矛盾を、今回はテストが自動で捕まえた。',
  23: '人間が読むのはこの報告とdiffだけ。介入は入口1回+出口1回。',
};

for (const [num, caption] of Object.entries(captions)) {
  const file = path.join(tmp, 'ppt', 'slides', `slide${num}.xml`);
  let xml = fs.readFileSync(file, 'utf8');
  xml = xml.replaceAll(`<a:t>${escapeXml(leakedInstruction)}</a:t>`, `<a:t>${escapeXml(caption)}</a:t>`);
  if (Number(num) === 19) {
    xml = xml.replaceAll('<a:t>captured from red-to-green.txt</a:t>', '<a:t></a:t>');
  }
  fs.writeFileSync(file, xml);
}

const notes = [
  '開幕: タイトルを短く読み、AIに任せる前に作業環境を作る話だと置く。日付を見せたらすぐ次へ進む。',
  '導入: AIがコードを書ける前提を確認する。ここでは良いプロンプトではなく、安全に任せる枠組みを扱うと伝える。',
  '課題提示: 既存システムで急に仕様変更を頼まれる状況を想像してもらう。参加者の経験に引き寄せてから進める。',
  '失敗構造: 直接依頼、部分更新、確認漏れの順に読む。全部を説明せず、後半のデモで一つずつ回収すると予告する。',
  'ゴール共有: 人間の判断を入口に置き、AIの作業をセンサーで確認する流れを一枚で押さえる。用語は深掘りしない。',
  '役割整理: Guide、Sensor、Steeringを三つの箱として見る。ここで初めてハーネスの言葉を出し、難しくしすぎない。',
  'Guide説明: AGENTS、仕様書、ADRを例に、AIに先回りで渡す文脈だと説明する。ファイル名より役割を強調する。',
  'Sensor説明: テストやlintを、AIの自己申告ではなく機械的な確認信号として扱う。赤は失敗ではなく通知だと添える。',
  'Steering説明: 人間は全作業を追うのではなく、判断点で戻す役割を持つ。レビューと承認の話へ橋をかける。',
  '全体地図: 五つのDemoを流れとして見せる。個別の細部より、直接依頼から自律ループへ進む段階を押さえる。',
  '素材説明: 注文見積APIのドメインを短く説明する。税込みや送料の細部には入りすぎず、境界値が重要だと置く。',
  'Demo1開始: ハーネスなしの依頼文を見せる。ここではAIを責めず、確認の足場がない状態だと説明する。',
  '矛盾提示: shippingFeeとmessageの食い違いを指で追うように読む。ここで参加者に、どちらを信じるか問いかける。',
  'Demo2開始: characterization testは新機能ではなく現状固定だと説明する。境界値4999/5000をゆっくり見せる。',
  'テスト意義: 既存挙動を固定すると、次の変更で何が壊れたか見えるようになる。次のarchitecture sensorへつなぐ。',
  'Demo3開始: テストが緑でも構造違反は残るという切り口にする。赤の意味を、品質ゲートの補助信号として説明する。',
  'センサー赤: controllerに業務ルールが戻ったことを示す。赤の詳細を全部読まず、検出できた事実だけを残す。',
  'Demo4開始: full harnessではテスト、仕様、ADR、センサーをまとめて使う。ここから赤から緑への流れを見ると伝える。',
  '赤から緑: got 0の行で止め、Demo1の手動発見と対比する。全緑表に移ったら、確認が自動化された点を強調する。',
  '分担確認: 人間、AI、機械の三者を並べて読む。人間の仕事がゼロになる話ではないと明確にする。',
  'Change Request: 入口を一つに絞る価値を説明する。細かい成果物名より、受け入れ条件がテストへ流れる点を見る。',
  'Demo5開始: 自律ループは無制限の放任ではないと置く。CR、expected_behaviors、必要成果物が制約になると説明する。',
  '完了報告: 人間が読む範囲が報告とdiffに狭まる点を強調する。反復回数3と介入回数の比較を落ち着いて見せる。',
  '実行手順: LIVEで行う場合の安全な開き方を説明する。親ディレクトリを見せない理由を短く添える。',
  'リスク整理: 時間、ネットワーク、権限、モデル差を順に触れる。失敗時の退避先があることを講師向けに確認する。',
  '導入手順: 最初の一週間でやることを、テンプレート、既存テスト、センサーの順に読む。欲張らない姿勢を示す。',
  'まとめ: ハーネスはAIを止める壁ではなく、判断可能にする作業環境だと締める。最後の質疑へ自然に渡す。',
  '出典: 参考資料とローカル証拠物を分けて示す。リンクを読む時間は取らず、必要なら後で参照できると伝える。',
];

for (let i = 1; i <= notes.length; i += 1) {
  const file = path.join(tmp, 'ppt', 'notesSlides', `notesSlide${i}.xml`);
  if (!fs.existsSync(file)) continue;
  let xml = fs.readFileSync(file, 'utf8');
  xml = xml.replace(/<a:t>[\s\S]*?<\/a:t>/, `<a:t>${escapeXml(notes[i - 1])}</a:t>`);
  fs.writeFileSync(file, xml);
}

const fixed = path.join(root, 'outputs', 'aidea-workshop-20260626.fixed-09.pptx');
if (fs.existsSync(fixed)) fs.unlinkSync(fixed);
run('zip', ['-qr', fixed, '.'], tmp);
fs.renameSync(fixed, pptx);

console.log(JSON.stringify({ pptx, backup, slidesFixed: Object.keys(captions).map(Number), notesFixed: notes.length }, null, 2));

function run(command, args, cwd = undefined) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error([command, ...args].join(' ') + '\n' + (result.stdout || '') + (result.stderr || ''));
  }
  return result;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
