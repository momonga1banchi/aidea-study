import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(".");
const outputDir = path.join(root, "outputs");
const qaDir = path.join(outputDir, "qa");
const slidesDir = path.join(qaDir, "slides");
const finalPptx = path.join(outputDir, "aidea-workshop-20260626.pptx");
const scratchRoot = path.join(os.tmpdir(), "codex-presentations", "manual-flow-rebuild", "aidea-workshop-20260626");
const scratchTmp = path.join(scratchRoot, "tmp");

const slideSize = { width: 1280, height: 720 };
const frame = { left: 56, top: 44, width: 1168, height: 632 };
const C = {
  bg: "#ECE7E2",
  ink: "#14204A",
  muted: "#52607A",
  faint: "#D5CEC4",
  panel: "#FBF8F2",
  dark: "#172452",
  navy: "#172452",
  titleGreen: "#3D9448",
  orange: "#C85B1A",
  amber: "#E7B148",
  green: "#33824A",
  red: "#D92626",
  blue: "#1A4F8F",
  paleBlue: "#C9D7F5",
};
const font = {
  head: "Yu Gothic",
  body: "Yu Gothic",
  mono: "Menlo",
};

async function locateArtifactToolUtils() {
  const base = path.join(os.homedir(), ".codex/plugins/cache/openai-primary-runtime/presentations");
  const versions = fsSync.existsSync(base)
    ? fsSync.readdirSync(base).filter((name) => {
      return [
        "skills/presentations/container_tools/artifact_tool_utils.mjs",
        "skills/presentations/scripts/artifact_tool_utils.mjs",
      ].some((candidate) => fsSync.existsSync(path.join(base, name, candidate)));
    }).sort()
    : [];
  if (!versions.length) throw new Error(`artifact_tool_utils.mjs not found under ${base}`);
  const versionDir = path.join(base, versions.at(-1));
  for (const candidate of [
    "skills/presentations/container_tools/artifact_tool_utils.mjs",
    "skills/presentations/scripts/artifact_tool_utils.mjs",
  ]) {
    const fullPath = path.join(versionDir, candidate);
    if (fsSync.existsSync(fullPath)) return fullPath;
  }
}

function px(value) {
  return Math.round(value);
}

function addShape(slide, geometry, x, y, w, h, fill, lineFill = "none", lineWidth = 0) {
  return slide.shapes.add({
    geometry,
    position: { left: px(x), top: px(y), width: px(w), height: px(h) },
    fill,
    line: { style: "solid", fill: lineFill, width: lineWidth },
  });
}

function addText(slide, text, x, y, w, h, opts = {}) {
  const box = addShape(slide, "textbox", x, y, w, h, "none");
  box.text = String(text);
  box.text.style = {
    fontSize: opts.size ?? 20,
    bold: opts.bold ?? false,
    color: opts.color ?? C.ink,
    typeface: opts.mono ? font.mono : opts.head ? font.head : font.body,
    alignment: opts.align ?? "left",
  };
  return box;
}

function addHeader(slide, meta, index) {
  slide.background.fill = C.bg;
  addShape(slide, "rect", 0, 0, 14, 720, C.navy);
  addShape(slide, "rect", frame.left - 2, frame.top - 2, 8, 28, C.green);
  addText(slide, meta.eyebrow ?? "", frame.left + 18, frame.top - 4, 380, 28, {
    size: 13,
    bold: true,
    color: C.green,
  });
  addText(slide, meta.title, frame.left, frame.top + 46, 1050, 76, {
    size: meta.titleSize ?? 36,
    bold: true,
    color: C.navy,
    head: true,
  });
  if (meta.subtitle) {
    if (/^L\d:/.test(meta.subtitle)) {
      addShape(slide, "rect", 804, 34, 360, 28, "#F4F0E8", C.faint, 1);
      addText(slide, meta.subtitle, 818, 39, 332, 20, {
        size: 13,
        bold: true,
        color: C.green,
      });
      addShape(slide, "rect", 804, 68, 360, 28, "#EEF3EC", "#C7D8C5", 1);
      addText(slide, "お題: 送料無料 5,000円 -> 7,000円", 818, 73, 332, 20, {
        size: 13,
        bold: true,
        color: C.navy,
      });
    } else {
      addText(slide, meta.subtitle, frame.left, frame.top + 124, index === 0 ? 630 : 900, index === 0 ? 64 : 44, {
        size: 22,
        bold: true,
        color: C.muted,
      });
    }
  }
  addText(slide, String(index + 1), 1168, 664, 34, 20, { size: 12, color: C.muted, align: "right" });
}

function addBullets(slide, items, x, y, w, opts = {}) {
  const size = opts.size ?? 23;
  const gap = opts.gap ?? 54;
  items.forEach((item, i) => {
    const yy = y + i * gap;
    const color = item.color ?? opts.dot ?? C.green;
    addShape(slide, "rect", x, yy + 8, 10, 10, color);
    addText(slide, item.text ?? item, x + 26, yy, w - 26, opts.lineHeight ?? 44, {
      size,
      bold: item.bold ?? false,
      color: item.textColor ?? C.ink,
    });
  });
}

function addCard(slide, x, y, w, h, title, body, opts = {}) {
  const pad = w < 220 ? 14 : 24;
  const titleSize = opts.titleSize ?? (w < 220 ? 18 : 20);
  addShape(slide, "rect", x, y, w, h, opts.fill ?? C.panel, opts.line ?? C.faint, 1);
  addShape(slide, "rect", x, y, 7, h, opts.accent ?? opts.titleColor ?? C.green);
  addText(slide, title, x + pad, y + 16, w - pad * 2, 30, { size: titleSize, bold: true, color: opts.titleColor ?? C.navy });
  addText(slide, body, x + pad, y + 56, w - pad * 2, h - 68, { size: opts.bodySize ?? 18, color: opts.bodyColor ?? C.muted });
}

function addTerminal(slide, lines, x, y, w, h, opts = {}) {
  addShape(slide, "rect", x, y, w, h, C.dark, C.dark, 1);
  addText(slide, lines.join("\n"), x + 22, y + 20, w - 44, h - 40, {
    size: opts.size ?? 17,
    color: "#F8FAFC",
    mono: true,
  });
}

function addTable(slide, x, y, w, rowH, headers, rows, opts = {}) {
  const colW = opts.colWidths ?? headers.map(() => w / headers.length);
  let yy = y;
  addShape(slide, "rect", x, yy, w, rowH, opts.headerFill ?? C.navy, C.navy, 1);
  let xx = x;
  headers.forEach((header, i) => {
    addText(slide, header, xx + 12, yy + 9, colW[i] - 24, rowH - 12, { size: opts.headerSize ?? 16, bold: true, color: "#FFFFFF", align: opts.headerAlign ?? "center" });
    xx += colW[i];
  });
  yy += rowH;
  rows.forEach((row, r) => {
    addShape(slide, "rect", x, yy, w, rowH, r % 2 === 0 ? C.panel : "#F3EEE7", C.faint, 1);
    xx = x;
    row.forEach((cell, i) => {
      addText(slide, cell, xx + 12, yy + 9, colW[i] - 24, rowH - 12, { size: opts.bodySize ?? 15, bold: i === 0, color: i === 0 ? C.ink : C.muted, align: opts.bodyAlign ?? "left" });
      xx += colW[i];
    });
    yy += rowH;
  });
}

function addLevelStrip(slide, active, y = 602) {
  const labels = ["L0\n開始前", "L1\n変更", "L2\n挙動", "L3\n構造", "L4\n候補", "L5\n介入圧縮"];
  const x = 72;
  const w = 174;
  labels.forEach((label, i) => {
    const fill = i === active ? C.green : "#E4DED4";
    const text = i === active ? "#FFFFFF" : C.muted;
    addShape(slide, "rect", x + i * (w + 10), y, w, 50, fill, fill, 1);
    addText(slide, label, x + i * (w + 10) + 12, y + 8, w - 24, 34, { size: 14, bold: true, color: text, align: "center" });
  });
}

function addStatus(slide, achieved, missing, level) {
  addCard(slide, 72, 444, 530, 116, "達成できたこと", achieved, { fill: "#F2F7EF", line: "#BFD3B8", titleColor: C.green, bodySize: 17 });
  addCard(slide, 638, 444, 530, 116, "まだ足りないこと", missing, { fill: "#FFF6EE", line: "#E3C6A7", titleColor: C.orange, bodySize: 17 });
  addLevelStrip(slide, level);
}

const slides = [
  {
    eyebrow: "AI TEST AUTOMATION",
    title: "AI時代のテスト自動化入門",
    titleSize: 42,
    subtitle: "AIエージェントに安全に開発を任せるための\nハーネスエンジニアリング",
    render(slide) {
      addText(slide, "2026/06/26  AIdea勉強会", 72, 250, 520, 34, { size: 22, color: C.muted });
      addShape(slide, "rect", 704, 186, 410, 264, C.panel, C.faint, 1);
      addShape(slide, "rect", 704, 186, 410, 7, C.green);
      addText(slide, "AI", 754, 240, 92, 70, { size: 56, bold: true, color: C.green, align: "center" });
      addText(slide, "code", 880, 250, 128, 54, { size: 36, bold: true, color: C.navy, align: "center" });
      addText(slide, "release?", 810, 346, 260, 50, { size: 38, bold: true, color: C.blue, align: "center" });
      addShape(slide, "rect", 850, 314, 122, 4, C.faint);
      addShape(slide, "rect", 928, 330, 4, 34, C.faint);
    },
    notes: [
      "冒頭では、今日の主語をAIの性能比較ではなく業務開発の受け入れ判断に置く。",
      "タイトルを読んだあと、テスト自動化からハーネスへ進む理由を短く予告する。",
    ],
  },
  {
    eyebrow: "PURPOSE",
    title: "勉強会の目的",
    subtitle: "AI活用を、現場で使える判断の型にする",
    render(slide) {
      addBullets(slide, [
        { text: "AIに触れるだけで終わらせず、既存開発へ持ち帰れる形にする", bold: true },
        "テスト自動化を、AIの作業結果を受け入れる仕組みとして捉え直す",
        "完璧な導入手順ではなく、明日から始められる小さな一歩を持つ",
      ], 92, 200, 820, { size: 22, gap: 66 });
      addCard(slide, 890, 204, 250, 220, "成功条件", "一人でも二人でも、これは自分の現場で使えそうだと思えること。", { titleColor: C.orange, bodySize: 19 });
    },
    notes: [
      "運営視点の目的を短く置き、参加者の理解度に幅がある前提を認める。",
      "ここで詳細な技術説明へ入らず、現場で使える順番を見せる会だと線を引く。",
    ],
  },
  {
    eyebrow: "TAKEAWAYS",
    title: "今日持ち帰ってほしいこと",
    render(slide) {
      addCard(slide, 72, 174, 520, 88, "1. AIはかなり直せる", "実装もテストも、強いエージェントなら想像以上に進められる。");
      addCard(slide, 72, 288, 520, 88, "2. それでも根拠が必要", "業務開発では「できました」だけでリリース判断できない。");
      addCard(slide, 638, 174, 520, 88, "3. テストは足場になる", "既存挙動を固定すると、変更後の無事を機械で確認できる。");
      addCard(slide, 638, 288, 520, 88, "4. 人間は判断を設計する", "CR、センサー、記録を見て、次へ進めるかを判断する。");
      addStatus(slide, "到達点を先に共有", "デモの見方を決める", 0);
    },
    notes: [
      "持ち帰りは技術要素の羅列にせず、受け入れ判断の根拠という一本の線で読む。",
      "Demo 1がAIの失敗紹介ではないことを、この段階で軽く伏線として置く。",
    ],
  },
  {
    eyebrow: "QUESTION",
    title: "AIに修正させたあと、何をもってリリースOKと言えるか",
    render(slide) {
      addShape(slide, "rect", 78, 178, 660, 190, "#FFFFFF", C.faint, 1);
      addText(slide, "依頼", 108, 206, 80, 28, { size: 18, bold: true, color: C.orange });
      addText(slide, "既存の注文見積りAPIで、\n送料無料条件を5,000円以上から7,000円以上へ変更してください。", 108, 250, 590, 82, { size: 27, bold: true, color: C.ink });
      addCard(slide, 790, 178, 338, 190, "問い", "自分が関わっていない既存プロジェクトなら、どこまで確認したらOKと言えるか。", { titleColor: C.blue, bodySize: 22 });
      addBullets(slide, ["既存機能は壊れていないか", "仕様書と実装は一致しているか", "AIの差分は保守できる形か", "判断理由は次回に残るか"], 96, 432, 960, { size: 20, gap: 44, dot: C.blue });
    },
    notes: [
      "問いを出したら数秒黙り、参加者に自分の案件を想像してもらう。",
      "ここで答えを急がず、以後のデモがこの問いへ段階的に答えると伝える。",
    ],
  },
  {
    eyebrow: "FIELD REALITY",
    title: "既存システムにAIを入れるときの現場課題",
    render(slide) {
      addCard(slide, 72, 166, 520, 98, "テストが薄い", "手動確認や担当者の記憶に頼っている。");
      addCard(slide, 638, 166, 520, 98, "仕様が分散", "docs、Slack、コード、運用判断が別々の場所にある。");
      addCard(slide, 72, 304, 520, 98, "AIの差分は速い", "見た目は良さそうでも、根拠が弱いまま進みやすい。");
      addCard(slide, 638, 304, 520, 98, "確認が詰まる", "レビュー担当が全部を見ると、速度差が確認負荷に変わる。");
      addStatus(slide, "課題を分解した", "まだ解決策は入っていない", 0);
    },
    notes: [
      "参加者にとって身近な痛みを並べ、抽象論ではなく保守開発の話だと示す。",
      "ここでは怖さを煽りすぎず、分解すれば扱える課題だと次の章へ送る。",
    ],
  },
  {
    eyebrow: "REDEFINE TEST AUTOMATION",
    title: "テスト自動化とは、判断材料を自動で集めること",
    render(slide) {
      addCard(slide, 86, 188, 475, 210, "従来の見方", "人間が書くテストコードを、AIやツールで速く作る。", { titleColor: C.muted, bodySize: 24 });
      addCard(slide, 670, 188, 475, 210, "今日の見方", "AIが変更したあと、人間が受け入れ判断できる材料を自動で集める。", { titleColor: C.orange, bodySize: 24 });
      addShape(slide, "rect", 584, 278, 56, 6, C.orange);
      addText(slide, "テストはゴールではなく、判断のためのセンサー", 210, 480, 840, 34, { size: 26, bold: true, color: C.ink, align: "center" });
    },
    notes: [
      "テスト自動化を広く定義し直し、参加者が期待しているテーマからハーネスへ橋をかける。",
      "テストコード生成の話を否定せず、その先に受け入れ判断があると置く。",
    ],
  },
  {
    eyebrow: "AI AGENT",
    title: "AIエージェントは便利だが、受け入れ責任は残る",
    render(slide) {
      addTable(slide, 82, 174, 1090, 48, ["AIができること", "残るリスク", "人間が決めること"], [
        ["読む", "古いdocsを信じる", "根拠の優先順位"],
        ["直す", "範囲外まで触る", "変更の境界"],
        ["テストを書く", "都合のよい観点に寄る", "代表値と不変条件"],
        ["実行して修復", "緑にするための雑な変更", "受け入れ条件"],
      ], { colWidths: [330, 360, 400], bodySize: 17 });
      addText(slide, "AIが作業を肩代わりしても、リリース判断は人間の責務として残る。", 142, 556, 996, 34, { size: 24, bold: true, color: C.orange, align: "center" });
    },
    notes: [
      "AIの能力を低く見積もらず、できることを認めた上で責任境界を話す。",
      "この責任境界が曖昧なまま導入すると、人間の不安が消えないと説明する。",
    ],
  },
  {
    eyebrow: "HARNESS",
    title: "ハーネスエンジニアリング",
    subtitle: "AIが安全に作業できる足場を作る",
    render(slide) {
      addCard(slide, 82, 206, 320, 180, "作業前", "前提、制約、変更範囲を渡す", { titleColor: C.blue, bodySize: 23 });
      addCard(slide, 480, 206, 320, 180, "作業後", "テストやセンサーで結果を見る", { titleColor: C.green, bodySize: 23 });
      addCard(slide, 878, 206, 320, 180, "判断後", "理由と残リスクを記録する", { titleColor: C.orange, bodySize: 23 });
      addText(slide, "ハーネス = AIの自由度を消すものではなく、受け入れ可能な範囲へ導くもの", 146, 482, 980, 44, { size: 25, bold: true, color: C.ink, align: "center" });
    },
    notes: [
      "ハーネスという言葉の初出なので、足場という短い定義で止める。",
      "細部の名前は次のスライドで扱い、ここでは前後と判断がつながる絵を印象づける。",
    ],
  },
  {
    eyebrow: "BACKGROUND",
    title: "ハーネスエンジニアリングを軽く整理すると",
    render(slide) {
      addCard(slide, 72, 158, 1088, 96, "参照している整理", "Birgitta Böckeler氏がMartin Fowlerサイトの記事で、coding agent利用者向けにまとめた考え方。", { titleColor: C.blue, bodySize: 22 });
      addTable(slide, 72, 292, 1088, 46, ["観点", "この資料での読み替え"], [
        ["目的", "coding agentの結果を信頼しやすくするため、作業前のGuidesと作業後のSensorsを設計する"],
        ["動き", "望ましくない出力を先に防ぎ、出た問題はセンサーで検出して自己修正へ回す"],
        ["人間の役割", "すべてを読むのではなく、GuidesとSensorsを育て、重要判断へ集中する"],
        ["今回のデモ", "CR、AGENTS.md、テスト、policy-boundary、worklogで小さく体験する"],
      ], { colWidths: [180, 908], rowH: 58, bodySize: 15 });
      addText(slide, "重要: AIを信じる/信じないではなく、AIが出した変更を判断できる形にする。", 142, 574, 996, 30, { size: 23, bold: true, color: C.orange, align: "center" });
    },
    notes: [
      "ここは歴史講義にしない。Birgitta Böckeler氏の記事を背景に、coding agent利用者が信頼を作るための実務的な整理として軽く触れる。",
      "Guidesはfeedforward、Sensorsはfeedbackに相当するが、用語の対応を細かく説明しすぎず、次の三要素スライドへ渡す。",
      "参考文献としてMartin FowlerサイトのHarness engineering for coding agent usersをソースノートに記録している。",
    ],
  },
  {
    eyebrow: "GLOSSARY",
    title: "先におさえる用語",
    render(slide) {
      addTable(slide, 58, 150, 1164, 46, ["用語", "この資料での意味", "今回の例"], [
      ["CR", "Change Request。変更依頼、背景、受け入れ条件、対象外をまとめる入口", "送料無料を7,000円以上へ変更"],
        ["AGENTS.md", "Codex向けの作業規約。CLAUDE.md / GEMINI.mdと同じ立ち位置", "責務境界、テスト、記録ルール"],
        ["ADR", "Architecture Decision Record。設計判断と理由を短く残す記録", "閾値変更やpolicy境界の判断"],
        ["characterization test", "正しい仕様ではなく、変更前の現在の振る舞いを固定するテスト", "4999/5000境界を固定"],
        ["Sensor", "機械的な確認。赤/緑で受け入れ前の問題を見つける", "test、policy-boundary、API response"],
        ["Steering", "人間が判断し、その判断を次回の前提へ戻すこと", "diff、worklog、completion-report"],
      ], { colWidths: [210, 570, 384], rowH: 58, bodySize: 14 });
      addText(slide, "以後のデモでは、これらを少しずつ足していく。", 284, 570, 720, 30, { size: 23, bold: true, color: C.orange, align: "center" });
    },
    notes: [
      "非エンジニアやAI初学者が置いていかれないよう、用語をここで一度だけ整理する。",
      "AGENTS.mdはCodexで読む作業規約ファイル名で、Claude CodeのCLAUDE.mdやGeminiのGEMINI.mdと同じ役割だと補足する。",
    ],
  },
  {
    eyebrow: "THREE PARTS",
    title: "Guides / Sensors / Steering の役割",
    render(slide) {
      addCard(slide, 72, 178, 340, 210, "Guides", "仕様書 / CR / ADR\nAGENTS.md / 禁止事項\nAIへ作業前に渡す前提。", { titleColor: C.blue, bodySize: 19 });
      addCard(slide, 470, 178, 340, 210, "Sensors", "test / lint / typecheck\npolicy-boundary\nAPIレスポンス形式\n作業後に機械で見る結果。", { titleColor: C.green, bodySize: 19 });
      addCard(slide, 868, 178, 340, 210, "Steering", "レビュー / worklog\n判断記録 / 次の前提\n人間が舵を切る場所。", { titleColor: C.orange, bodySize: 19 });
      addText(slide, "今日のデモは、この3つを少しずつ足していく流れです。", 188, 494, 904, 34, { size: 26, bold: true, color: C.ink, align: "center" });
    },
    notes: [
      "3要素を暗記させるより、どのタイミングで効くかを短く説明する。",
      "この図が以後の地図になるため、デモごとに今どこを足したかへ戻ると予告する。",
    ],
  },
  {
    eyebrow: "ROADMAP",
    title: "今日のデモ全体像: 足りないものを減らす",
    render(slide) {
      addTable(slide, 58, 158, 1164, 48, ["レベル", "デモ", "できるようになること", "まだ足りないこと"], [
        ["L0", "開始前", "AIへ依頼はできる", "根拠、テスト、制約、記録"],
        ["L1", "Demo 1", "機能変更はできたかもしれない", "受け入れる証拠"],
        ["L2", "Demo 2", "既存挙動をテストで固定", "構造保証、Guides、記録"],
        ["L3", "Demo 3", "送料無料policyの責務境界を検出", "CR、Steering、出口"],
        ["L4", "Demo 4", "リリース候補としてレビュー可能", "CI、本番確認、運用"],
        ["L5", "Demo 5", "途中介入を減らせる", "センサー成熟、停止条件"],
      ], { colWidths: [90, 140, 420, 514], rowH: 54, bodySize: 15 });
    },
    notes: [
      "ここでデモ全体の見方を固定し、単発の成功や失敗を追わないようにする。",
      "各デモが終わったら表の該当レベルへ戻ると参加者に伝える。",
    ],
  },
  {
    eyebrow: "STARTING POINT",
    title: "デモ題材と開始時点の不足物",
    render(slide) {
      addTerminal(slide, [
        "project/",
        "  src/controllers/orderController.js",
        "  src/services/orderEstimateService.js",
        "  src/services/promotionService.js   # threshold重複",
        "  src/config/pricing.js              # threshold定義",
        "  docs/specs/order-estimate.md       # 3,000円の古い記述",
      ], 76, 174, 560, 260, { size: 18 });
      addTable(slide, 684, 174, 500, 42, ["観点", "開始時点"], [
        ["既存挙動の固定", "ない"],
        ["新仕様の受け入れ条件", "ない"],
        ["構造チェック", "ない"],
        ["AIへの作業規約", "ない"],
        ["判断記録", "ない"],
        ["人間が見る出口", "未定"],
      ], { colWidths: [260, 240], rowH: 44, bodySize: 16 });
    },
    notes: [
      "題材のコード量ではなく、既存案件らしい不安要素に注目してもらう。",
      "閾値重複は先に明かしすぎず、開始時点の不足としてさらっと置く。",
    ],
  },
  {
    eyebrow: "DEMO 1",
    title: "テストなしでAIに修正を頼む",
    subtitle: "L1: 機能変更はできたかもしれない",
    render(slide) {
      addTerminal(slide, [
        "$ prompt",
        "送料無料の条件を5,000円以上から7,000円以上に変更してください。",
        "",
        "$ rg \"5000|FREE_SHIPPING|threshold\" src docs",
        "src/config/pricing.js",
        "src/services/promotionService.js",
        "docs/specs/order-estimate.md",
      ], 82, 204, 700, 230, { size: 18 });
      addCard(slide, 824, 204, 318, 230, "見るポイント", "AIが間違えるかではなく、変更後に何を根拠として受け入れるかを見る。", { titleColor: C.orange, bodySize: 22 });
      addStatus(slide, "AIへ変更依頼できる", "証明と記録がない", 1);
    },
    notes: [
      "LIVEの結果が成功でも失敗でも同じ結論へ向かうことを、発表者自身が意識する。",
      "ここではAIの出力を長く追わず、確認根拠がない状態を観察する。",
    ],
  },
  {
    eyebrow: "DEMO 1 RESULT",
    title: "正しく直っても、テストなしでは証明できない",
    render(slide) {
      addTerminal(slide, [
        "$ curl subtotal=6000",
        "{\"subtotal\":6000,\"shippingFee\":500,",
        "\"freeShippingThreshold\":7000,",
        "\"freeShippingRemaining\":0,",
        "\"message\":\"送料無料\"}",
      ], 78, 190, 620, 220, { size: 19 });
      addCard(slide, 744, 190, 410, 220, "AIが両方直した場合でも", "testsなし / APIレスポンス形式チェックなし / 構造チェックなし / 判断記録なし。\n今回の成功を次回も守る根拠がない。", { titleColor: C.blue, bodySize: 20 });
      addStatus(slide, "手動確認は一部できた", "リリース判断はまだできない", 1);
    },
    notes: [
      "矛盾curlは失敗例として使い、AIが正しく直した場合の説明も同じ重さで扱う。",
      "最後は、問題はAIの能力ではなく継続的な証明手段がないことだと言い切る。",
    ],
  },
  {
    eyebrow: "DEMO 2",
    title: "まず観点を出し、既存挙動を固定する",
    subtitle: "L2: 現在地をテストに変える",
    render(slide) {
      addTerminal(slide, [
        "そのまま貼るプロンプト",
        "現在の注文見積もりAPIの挙動を調査し、",
        "既存挙動を固定するcharacterization testを作成してください。",
        "",
        "いきなりテストを書かず、先に観点表を出してください。",
        "観点: 公開API / 境界値 / 不変条件 / エラーケース / docs差分",
        "各観点について、テスト化する/しない、理由、確認方法を表にし、",
        "採用した観点だけをテストにしてください。",
      ], 72, 174, 660, 250, { size: 13 });
      addCard(slide, 770, 174, 390, 118, "AIが先に返すもの", "観点表: 何をテスト化し、何を記録に回すか。", { titleColor: C.blue, bodySize: 19 });
      addCard(slide, 770, 304, 390, 128, "AIが生成するもの", "tests/*.test.js / tests/testHelper.js\n境界値、不変条件、API response shape、不正入力。", { titleColor: C.green, bodySize: 18 });
      addStatus(slide, "既存挙動を再確認できる", "新仕様と構造保証はまだない", 2);
    },
    notes: [
      "characterization testは正しい未来を定義するテストではなく、現在地を固定するテストだと説明する。",
      "複雑なシステムでも全部を固定せず、変更対象に近い公開契約、境界値、不変条件を優先する。",
    ],
  },
  {
    eyebrow: "AFTER DEMO 2",
    title: "characterization testは、あとで3つに分かれる",
    render(slide) {
      addTable(slide, 76, 170, 1128, 54, ["種類", "扱い", "今回の例"], [
        ["残す", "回帰テストとして残す", "response形式、不正入力、total計算"],
        ["書き換える", "新仕様の受け入れテストへ変える", "4999/5000 -> 6999/7000"],
        ["記録へ移す", "worklogやADRへ残す", "docsは古い、閾値が重複していた"],
      ], { colWidths: [160, 420, 548], rowH: 70, bodySize: 17 });
      addCard(slide, 150, 440, 980, 92, "次の不足", "挙動を固定したので、次は挙動を変えずに送料無料判定の責務を一箇所へ寄せる。", { titleColor: C.orange, bodySize: 22 });
      addLevelStrip(slide, 2);
    },
    notes: [
      "古い挙動を守り続けるためのテストではないことを、ここで必ず説明する。",
      "Demo 3へ進む橋として、仕様を変える前に変更しやすい構造へ寄せると伝える。",
    ],
  },
  {
    eyebrow: "DEMO 3",
    title: "送料無料policyの責務境界をセンサーで止める",
    subtitle: "L3: 動けばOKではなく、保守できる形も見る",
    render(slide) {
      addTerminal(slide, [
        "そのまま貼るプロンプト",
        "送料無料判定の責務を整理してください。",
        "",
        "条件:",
        "- API挙動は変えない / 既存testは全て通す",
        "- 判定・閾値取得・残額計算を1つのpolicy moduleへ集約",
        "- orderEstimateServiceとpromotionServiceで閾値判断を分裂させない",
        "- 境界ドキュメントとpolicy-boundary sensorを作る",
        "- test/API shapeはlisten不要のin-process確認にする",
        "- npm run sensorsに登録して実行する",
      ], 68, 166, 620, 270, { size: 12 });
      addCard(slide, 716, 166, 250, 270, "AIが作る/変える", "src/services:\n- freeShippingPolicy.js\n- orderEstimateService.js\n- promotionService.js\n\ndocs/architecture:\n- order-estimate-boundaries.md\n\nscripts/package:\n- check-policy-boundary.js\n- run-sensors.js\n- package.json", { titleColor: C.blue, bodySize: 12 });
      addCard(slide, 992, 166, 184, 270, "完了条件", "node --test green\npolicy-boundary green\nin-process API green\n\n実サーバcurl:\n人間/CI", { titleColor: C.green, bodySize: 14 });
      addStatus(slide, "責務境界を検出できる", "CRと出口判断がまだない", 3);
    },
    notes: [
      "Demo 3では7,000円へ変えない。既存挙動を変えず、次に変えやすい構造へ整える。",
      "controller直書きの不自然な例ではなく、今回のコードに実際にある閾値重複を題材にする。",
    ],
  },
  {
    eyebrow: "AFTER DEMO 3",
    title: "ここまでに、どのプロンプトで何を作らせたか",
    render(slide) {
      addTable(slide, 62, 164, 1156, 48, ["段階", "人がプロンプトで依頼すること", "AIが生成/登録するもの"], [
        ["Demo 2", "観点表を出し、採用観点だけをテスト化", "tests/*.test.js / tests/testHelper.js"],
        ["Demo 3", "送料無料判定を1つのpolicy moduleへ集約", "freeShippingPolicy.js / orderEstimateService.js / promotionService.js"],
        ["Demo 3", "責務境界を文書化し、policy sensorを登録", "order-estimate-boundaries.md / check-policy-boundary.js / run-sensors.js / package.json"],
      ], { colWidths: [120, 500, 536], rowH: 74, bodySize: 14 });
      addText(slide, "ここまでで、既存挙動のテストとpolicy境界センサーが揃った。", 170, 536, 940, 30, { size: 24, bold: true, color: C.orange, align: "center" });
      addLevelStrip(slide, 3);
    },
    notes: [
      "ここではDemo 4の成果物を先取りせず、Demo 2とDemo 3で実際に作らせたものだけを整理する。",
      "次のDemo 4では、ここまでに作った足場を使って7,000円への変更へ進む。",
    ],
  },
  {
    eyebrow: "DEMO 4 GUIDES",
    title: "Demo 4の前に、人間が用意しておくGuides",
    render(slide) {
      addTable(slide, 58, 154, 1164, 48, ["ファイル", "誰が用意", "中身"], [
        ["CR", "人間", "背景: 配送コスト上昇 / 受け入れ条件: 6,999円は送料500円、7,000円は送料0円 / 対象外: UI・税・DB"],
        ["AGENTS.md", "人間/チーム", "作業範囲はCR内 / API response形式は変えない / 既存テストを削除して逃げない / sensorsを実行"],
        ["order-estimate.md", "既存docs", "last-updated: 2024-11 / 送料無料閾値: 3,000円 / 現実と異なる可能性あり"],
        ["ADR-0001", "既存docs", "controllerはHTTP入出力だけ / 計算はservice / 閾値と送料はconfig / policy境界を守る"],
      ], { colWidths: [160, 160, 844], rowH: 76, bodySize: 13 });
      addText(slide, "ここはAIが勝手に作るものではない。人間が入口として置き、AIに読ませる前提。", 150, 568, 980, 30, { size: 22, bold: true, color: C.orange, align: "center" });
    },
    notes: [
      "Demo 4に入る前に、CR、AGENTS.md、古いspec、既存ADRは人間が用意しているGuidesだと明確にする。",
      "特にorder-estimate.mdは古い情報を含むため、AIに鵜呑みにさせず、コードとテストで現実確認させる入口として扱う。",
    ],
  },
  {
    eyebrow: "DEMO 4",
    title: "Guidesを読ませて、リリース候補にできる形で頼む",
    subtitle: "L4: Guides / Sensors / Steering を一周させる",
    render(slide) {
      addCard(slide, 70, 184, 350, 220, "前提として読むもの", "CR\nAGENTS.md / CLAUDE.md\norder-estimate.md\nADR-0001\n\n古いdocsは鵜呑みにせず、コードとテストで確認する。", { titleColor: C.blue, bodySize: 17 });
      addTerminal(slide, [
        "そのまま貼るプロンプト",
        "AGENTS.mdを読んだ上で、",
        "CR-2026-06-26-free-shipping-thresholdを実装してください。",
        "- 既存testを残す/書き換える/記録へ移す",
        "- 4999/5000を6999/7000へ書き換える",
        "- spec / ADR / worklogを更新する",
        "- 全センサー緑で完了報告する",
      ], 454, 184, 390, 220, { size: 12 });
      addCard(slide, 878, 184, 318, 220, "AIが生成/更新するもの", "src/config/pricing.js\n境界値テスト\norder-estimate.md\nADR\nworklog", { titleColor: C.orange, bodySize: 18 });
      addStatus(slide, "作業前提と確認が揃った", "出口レビューは人間が行う", 4);
    },
    notes: [
      "Demo 4は同じ依頼を豪華にするだけではなく、受け入れ可能な形へ変える実演だと話す。",
      "CR、AGENTS.md、spec、ADRは資料上の飾りではなく、AIの探索範囲と完了条件を決める入口だと伝える。",
    ],
  },
  {
    eyebrow: "RED TO GREEN",
    title: "古い挙動テストを、新仕様の受け入れテストへ変える",
    render(slide) {
      addTerminal(slide, [
        "RED: expected free shipping at 5000, got 500",
        "",
        "rewrite:",
        "- 4999 / 5000 -> 6999 / 7000",
        "- response shape stays",
        "- invalid input stays",
        "- total = subtotal + shippingFee stays",
        "",
        "| sensor | after fix |",
        "| test | green |",
        "| policy-boundary | green |",
        "| APIレスポンス形式 | green |",
      ], 78, 176, 735, 330, { size: 16 });
      addCard(slide, 852, 176, 310, 330, "Demo 1との違い", "人間がcurlで探していた不安を、今回はテストが赤として止める。\nAIはどのテストを残し、どれを書き換えるかを説明して緑へ戻す。", { titleColor: C.green, bodySize: 20 });
      addLevelStrip(slide, 4);
    },
    notes: [
      "赤が出ること自体を失敗扱いにしない。",
      "重要なのは、characterization testを古い仕様の固定具にせず、新仕様の受け入れテストへ変換することだと読む。",
    ],
  },
  {
    eyebrow: "RESPONSIBILITY",
    title: "人間とAIと機械の責務を分ける",
    render(slide) {
      addTable(slide, 86, 176, 1080, 56, ["担当", "見るもの", "判断"], [
        ["機械", "test / lint / typecheck / policy-boundary / APIレスポンス形式", "条件に合わなければ赤"],
        ["AI", "赤の原因、関連ファイル、修復方針", "修正して再実行"],
        ["人間", "CR、diff、残リスク、worklog、ADR", "業務として受け入れるか"],
        ["現場CI", "同じセンサーの自動実行", "マージ前に止める"],
      ], { colWidths: [160, 520, 400], rowH: 66, bodySize: 17 });
      addText(slide, "人間の仕事は、全部を見ることから、重要判断を行うことへ移る。", 184, 560, 912, 32, { size: 24, bold: true, color: C.orange, align: "center" });
    },
    notes: [
      "責務分担を曖昧にしないことで、AI導入への心理的な不安を下げる。",
      "人間の仕事が消えるのではなく、見るべき場所が絞られると説明する。",
    ],
  },
  {
    eyebrow: "RELEASE CANDIDATE",
    title: "リリース候補として揃ったもの、まだ現場で足すもの",
    render(slide) {
      addTerminal(slide, [
        "docs/specs/order-estimate.md",
        "last-updated: 2026-06-26",
        "送料無料閾値: 7,000円",
        "6,999円 => 送料500円",
        "7,000円 => 送料0円",
      ], 70, 166, 340, 210, { size: 14 });
      addTerminal(slide, [
        "docs/decisions/ADR-0002",
        "Context: CR-2026-06-26",
        "Decision:",
        "- thresholdはpricing.js",
        "- 判定はfreeShippingPolicy",
        "- response形式は維持",
      ], 470, 166, 340, 210, { size: 14 });
      addTerminal(slide, [
        "docs/ai/worklog.md",
        "依頼: CR-2026-06-26",
        "やったこと: threshold/test/spec/ADR",
        "発見: 旧specは3,000円",
        "残リスク: UI/改定日/過去注文",
      ], 870, 166, 340, 210, { size: 14 });
      addTable(slide, 92, 420, 1096, 42, ["ここまでで揃ったもの", "現場でまだ足すもの"], [
        ["受け入れ条件、テスト、policy-boundary、spec、ADR、worklog", "CI、事業側確認、本番相当データ、非機能、監視、ロールバック"],
      ], { colWidths: [520, 576], rowH: 64, bodySize: 15 });
      addLevelStrip(slide, 4);
    },
    notes: [
      "Demo 4でAIが更新する資料の中身を見せ、spec、ADR、worklogが単なるファイル名ではないことを伝える。",
      "ここで万能感を出さず、リリース候補と本番リリースの間に残る仕事を明確にする。",
    ],
  },
  {
    eyebrow: "DEMO 5 GUIDES",
    title: "Demo 5の前に、人間が自律ループの入口を設計する",
    render(slide) {
      addTerminal(slide, [
        "CR front-matter",
        "status: in_progress",
        "acceptance: [test, lint, typecheck,",
        "  policy-boundary, api-response, change-package]",
        "expected_behaviors:",
        "  6999 => 送料500 / 7000 => 送料0",
        "required_artifacts:",
        "  spec / ADR / worklog / test",
        "loop sensor:",
        "  no listen / in-process",
        "max_iterations: 5",
      ], 70, 164, 510, 270, { size: 12 });
      addTerminal(slide, [
        "AGENTS.md ループプロトコル",
        "1. status: in_progress のCRを読む",
        "2. loop-stateに計画を書く",
        "3. failing test -> 最小実装",
        "4. 毎回 npm run sensors",
        "5. 赤なら原因と次方針を記録",
        "6. completion-reportを書いて停止",
        "",
        "停止条件: max_iterations / 同一赤 / scope外",
      ], 628, 164, 560, 270, { size: 12 });
      addShape(slide, "rect", 150, 466, 980, 98, C.panel, C.faint, 1);
      addText(slide, "重要", 180, 488, 120, 24, { size: 18, bold: true, color: C.orange });
      addText(slide, "ここで増えるのは、入口CR・ループ規約・停止条件・出口reportです。", 180, 526, 920, 28, { size: 22, color: C.muted });
    },
    notes: [
      "Demo 5もAIが勝手に自律ループを始めるのではなく、人間が機械可読CRとループプロトコルを事前に設計する。",
      "ここを見せずにDemo 5へ入ると、completion-reportやloop-stateが自然発生したように見えるため、必ず入口を説明する。",
    ],
  },
  {
    eyebrow: "DEMO 5",
    title: "完了条件と停止条件で途中介入を減らす",
    subtitle: "L5: 入口と出口に人間の確認を寄せる",
    render(slide) {
      addTerminal(slide, [
        "そのまま貼るプロンプト",
        "AGENTS.mdに従い、CRを処理してください。",
        "- expected_behaviorsとrequired_artifactsを残作業リストにする",
        "- 赤sensor、原因、次方針をloop-stateへ更新する",
        "- policy-boundaryを壊さない",
        "- completion-report完成時だけ人間へ返す",
        "- 停止条件ならescalation-reportを書く",
      ], 66, 166, 540, 270, { size: 12 });
      addTerminal(slide, [
        "AIが更新する進行記録",
        "docs/ai/loop-state.md",
        "- iteration",
        "- red sensor",
        "- cause summary",
        "- next plan",
        "",
        "docs/ai/completion-report.md",
        "- sensor結果",
        "- CI/人間の出口確認",
        "- 残リスク",
        "- 人間が見る点",
      ], 634, 166, 364, 270, { size: 12 });
      addCard(slide, 1022, 166, 176, 270, "AIが作る/更新", "loop-state\ncompletion-report\nspec / ADR\nworklog / test\nCR status\n\n停止時:\nescalation-report", { titleColor: C.blue, bodySize: 12 });
      addStatus(slide, "途中介入を減らせる", "センサーが薄い領域は守れない", 5);
    },
    notes: [
      "Demo 5は時間がなければ飛ばせるボーナスとして扱う。",
      "自律化そのものではなく、完了条件と停止条件を書けることが前提だと強調する。",
    ],
  },
  {
    eyebrow: "AUTONOMY BOUNDARY",
    title: "入口と出口に絞っても、人間の責任は残る",
    render(slide) {
      addTerminal(slide, [
        "completion-report",
        "- CR-ID: CR-2026-06-26-free-shipping-threshold",
        "- 反復回数: 3",
        "- 全sensor結果: green",
        "- 変更ファイルと一行理由",
        "- 残リスク",
        "- CI/人間の出口確認",
        "- 人間が確認すべき点: 3項目以内",
      ], 78, 184, 620, 260, { size: 17 });
      addTable(slide, 744, 184, 410, 54, ["人間の位置", "見るもの"], [
        ["入口", "CRの意図、対象外、受け入れ条件"],
        ["途中", "原則見ない。停止条件ならescalation-report"],
        ["出口", "diff、sensor結果、CI結果、残リスク、記録"],
      ], { colWidths: [110, 300], rowH: 64, bodySize: 15 });
      addLevelStrip(slide, 5);
    },
    notes: [
      "介入回数が減っても、出口で読むべきものは残ると明確にする。",
      "完成報告は信頼の代替ではなく、人間が判断するための圧縮された材料だと説明する。",
    ],
  },
  {
    eyebrow: "UPDATED VIEW",
    title: "テスト自動化の考え方を更新する",
    render(slide) {
      addCard(slide, 92, 194, 470, 230, "狭い定義", "テストコードを書く作業を自動化する。", { titleColor: C.muted, bodySize: 25 });
      addCard(slide, 706, 194, 470, 230, "今日の定義", "AIが変更しても壊れていないと判断する材料を自動で集める。", { titleColor: C.orange, bodySize: 25 });
      addText(slide, "コードを書くAIに対して、人間は仕様と検証の設計を担う。", 192, 502, 900, 34, { size: 26, bold: true, color: C.ink, align: "center" });
    },
    notes: [
      "ここで表向きのテーマであるテスト自動化へ戻す。",
      "デモを見たあとだから、テストが単体の技術ではなく受け入れ判断の一部だと伝わる。",
    ],
  },
  {
    eyebrow: "RECAP",
    title: "足りないものがどう埋まったか",
    render(slide) {
      addTable(slide, 70, 162, 1100, 48, ["観点", "開始時点", "デモ後"], [
        ["既存挙動", "ない", "characterization testで固定"],
        ["新仕様", "曖昧", "CRで受け入れ条件化"],
        ["構造", "見ていない", "policy-boundary sensorで検出"],
        ["作業規約", "プロンプト頼み", "AGENTS.mdで継続"],
        ["判断記録", "残らない", "spec / ADR / worklogへ還流"],
        ["出口", "人間が全部見る", "completion-reportで絞る"],
      ], { colWidths: [220, 340, 540], rowH: 54, bodySize: 16 });
    },
    notes: [
      "冒頭に出した不足物リストへ戻り、各デモが何を埋めたかを回収する。",
      "ここを丁寧に読むと、デモ同士が一つの流れとして見える。",
    ],
  },
  {
    eyebrow: "FIRST STEPS",
    title: "まず明日からできること",
    render(slide) {
      addBullets(slide, [
        { text: "変更依頼をCRとして短く書く", bold: true },
        "AIに影響範囲とテスト観点表を先に出させる",
        "人間が固定すべき既存挙動の範囲を決める",
        "採用した観点だけをテスト化して実行する",
        "判断理由と残リスクをworklogに1行残す",
      ], 104, 176, 940, { size: 24, gap: 68, dot: C.green });
      addText(slide, "最初から自律ループを目指さない。まず判断できる入口と出口を作る。", 150, 564, 980, 32, { size: 24, bold: true, color: C.orange, align: "center" });
    },
    notes: [
      "行動リストは小さくし、参加者が明日の案件で試せる粒度にする。",
      "特に最初の一歩は、人間が3例を決め打ちすることではなく、AIに観点を出させた上で人間が固定範囲を判断することだと念押しする。",
    ],
  },
  {
    eyebrow: "SUMMARY",
    title: "AIに任せるのではなく、AIに安全に任せられる状態を作る",
    titleSize: 34,
    render(slide) {
      addCard(slide, 118, 202, 1040, 210, "今日の結論", "AIが直せるかどうかだけを見ても、現場の不安は消えない。\n必要なのは、Guides / Sensors / Steeringでリリース判断の根拠を作ること。", { titleColor: C.orange, bodySize: 27 });
      addText(slide, "テスト自動化は、その最初の一歩になる。", 300, 500, 680, 38, { size: 30, bold: true, color: C.ink, align: "center" });
    },
    notes: [
      "最後は新しい用語を増やさず、今日の核となる一文だけを残す。",
      "質疑へ進む前に、テスト自動化がハーネスの入口であることを言い切る。",
    ],
  },
  {
    eyebrow: "Q&A",
    title: "質疑応答・アンケート",
    render(slide) {
      addText(slide, "質問", 120, 210, 260, 60, { size: 46, bold: true, color: C.orange });
      addText(slide, "アンケート", 120, 330, 300, 60, { size: 46, bold: true, color: C.blue });
      addCard(slide, 570, 196, 480, 230, "聞きたいこと", "現場適用の不安、テスト観点、センサーの作り方、AIへの依頼文など。", { titleColor: C.ink, bodySize: 24 });
      addText(slide, "次回テーマの希望もアンケートへお願いします。", 320, 520, 640, 32, { size: 24, bold: true, color: C.muted, align: "center" });
    },
    notes: [
      "質問が出にくい場合は、AIがテストを書き換える不安や既存仕様書が古いケースを促す。",
      "アンケートでは理解度だけでなく、現場で試せそうな一歩を聞く。",
    ],
  },
];

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(slidesDir, { recursive: true });
  await fs.mkdir(path.join(qaDir, "layout"), { recursive: true });
  await fs.mkdir(scratchTmp, { recursive: true });
  const utilsPath = await locateArtifactToolUtils();
  const { ensureArtifactToolWorkspace, importArtifactTool, saveBlobToFile } = await import(pathToFileURL(utilsPath));
  await ensureArtifactToolWorkspace(scratchTmp);
  const { Presentation, PresentationFile } = await importArtifactTool(scratchTmp);
  const presentation = Presentation.create({ slideSize });

  slides.forEach((spec, index) => {
    const slide = presentation.slides.add();
    addHeader(slide, spec, index);
    spec.render(slide);
    slide.speakerNotes.textFrame.setText(spec.notes);
    slide.speakerNotes.setVisible(true);
  });

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    const png = await presentation.export({ slide, format: "png", scale: 1 });
    await saveBlobToFile(png, path.join(slidesDir, `${stem}.png`));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(qaDir, "layout", `${stem}.layout.json`), await layout.text());
  }

  const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
  await saveBlobToFile(montage, path.join(qaDir, "deck-montage.webp"));
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(finalPptx);

  const review = slides.map((slide, index) => `- Slide ${index + 1}: ${slide.title} - visible check after artifact render.`).join("\n");
  await fs.writeFile(path.join(qaDir, "slide-review-notes.md"), `# Slide Review Notes\n\n${review}\n`, "utf8");
  await fs.writeFile(path.join(qaDir, "source-notes.txt"), [
    "Source notes for flow rebuild deck",
    "- Content source: 20260626-build-pack/10_FLOW-RESTRUCTURE-DRAFT.md",
    "- Content source: 20260626-build-pack/12_FLOW-REBUILD-DEEP-FIX-PROPOSAL.md",
    "- Demo evidence source: demo-units/*/instructor-materials/",
    "- Visual palette source: /Users/hajime/Downloads/AIdea Engineers第1回勉強会資料.pptx",
    "- External concept source: Birgitta Böckeler, Harness engineering for coding agent users, MartinFowler.com, 2026-04-02, https://martinfowler.com/articles/harness-engineering.html",
    "- No external screenshots or web assets used.",
  ].join("\n") + "\n", "utf8");
  await fs.writeFile(path.join(qaDir, "artifact-build-manifest.json"), JSON.stringify({
    finalPptx,
    slideCount: slides.length,
    generatedAt: new Date().toISOString(),
    tool: "@oai/artifact-tool",
    scratchTmp,
  }, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ finalPptx, slideCount: slides.length, slidesDir, scratchTmp }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
