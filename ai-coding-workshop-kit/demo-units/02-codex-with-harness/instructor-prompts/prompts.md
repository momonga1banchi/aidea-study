# 講師用プロンプト：Codex 良い例

## 目的

Codex Desktopで、ハーネスありの開発手順を見せます。

このファイルは講師だけが見ます。  
Codexにはこのファイルを読ませず、`project/` の中だけを開いてください。

## 進め方

Codex Desktopで、このデモ単位の `project/` を開きます。

```text
demo-units/02-codex-with-harness/project
```

## Step 1：調査と計画

```text
tasks/01-inspect-and-plan.md を読んで、その指示だけ実行してください。
まだファイルは編集せず、計画を報告した時点で止めてください。
回答は日本語でお願いします。
```

## Step 2：テストだけ追加

```text
tasks/02-add-tests-only.md を読んで、その指示だけ実行してください。
まだ本番コードは実装しないでください。
回答は日本語でお願いします。
```

## Step 3：最小実装

```text
tasks/03-implement-minimum.md を読んで、その指示だけ実行してください。
回答は日本語でお願いします。
```

## Step 4：差分レビュー

```text
tasks/04-review-diff.md を読んで、現在の差分をレビューしてください。
ファイルは変更しないでください。
回答は日本語でお願いします。
```

## 解説ポイント

- Codexには、AGENTS.mdでプロジェクトルールを渡している
- 仕様は docs/specs/member-discount.md に分離している
- 作業は tasks/*.md ごとに小さく区切っている
- 「調査と計画」「テストだけ」「実装」「レビュー」を分けている
- これにより、AIが一気に暴走しにくくなる

## 悪い例との比較観点

- 仕様を勝手に補完していないか
- 境界値テストが入ったか
- 異常系が入ったか
- 既存API形式に合わせたか
- test / lint / review が完了条件に入ったか
