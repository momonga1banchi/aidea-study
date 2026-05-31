# AI Coding Workshop Kit

社内AI勉強会「AIに丸投げしない開発術：Codex / Claudeで実践するハーネスエンジニアリング入門」用のハンズオンキットです。

## 目的

このキットは、Codex Desktop / Claude Desktop Codeタブで、AIに段階的に開発作業を進めてもらうためのサンプルリポジトリです。

人間向けの進行台本と、AIに読ませる短いタスクファイルを分けています。

## ディレクトリ構成

```text
.
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── package.json
├── docs/
│   ├── ai/
│   │   └── code-review.md
│   ├── specs/
│   │   └── member-discount.md
│   └── workshop/
│       └── facilitator-guide.md
├── tasks/
│   ├── 00-bad-example.md
│   ├── 01-inspect-and-plan.md
│   ├── 02-add-tests-only.md
│   ├── 03-implement-minimum.md
│   └── 04-review-diff.md
├── scripts/
│   └── lint.js
├── src/
│   ├── app.js
│   ├── controllers/
│   │   └── healthController.js
│   ├── routes/
│   │   └── healthRoutes.js
│   └── services/
│       └── healthService.js
└── tests/
    └── health.test.js
```

## セットアップ

```bash
npm install
npm test
npm run lint
```

## Codex Desktopでの使い方

1. Codex Desktopでこのフォルダを開く
2. 新しいthreadを作る
3. 以下を順番に入力する

```text
Read and execute tasks/00-bad-example.md.
```

悪い例の差分を見たら、変更を破棄します。

```bash
git restore .
```

その後、以下を順番に実行します。

```text
Read and execute tasks/01-inspect-and-plan.md.
Stop after reporting the plan.
```

```text
Read and execute tasks/02-add-tests-only.md.
Do not implement production code.
```

```text
Read and execute tasks/03-implement-minimum.md.
```

```text
Read and execute tasks/04-review-diff.md.
Do not modify files.
```

## Claude Desktopでの使い方

Claude Desktopの通常Chatではなく、Codeタブでこのフォルダを開いてください。

最初に以下を入力します。

```text
Please read CLAUDE.md and confirm the project rules you will follow.
Do not edit files.
```

その後、Codexと同じように `tasks/*.md` を順番に読ませます。

```text
Read and execute tasks/01-inspect-and-plan.md.
Stop after reporting the plan.
Do not edit files.
```

## 勉強会で伝えること

AIにコードを書かせる前に、以下を用意します。

- 仕様
- 制約
- 完了条件
- テスト
- lint
- 差分レビュー観点
- AGENTS.md / CLAUDE.md

AI開発の品質は、モデルの賢さだけではなく、人間が用意したハーネスで決まります。
