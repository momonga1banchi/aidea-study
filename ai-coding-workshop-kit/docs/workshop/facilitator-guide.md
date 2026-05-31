# 社内AI勉強会 進行台本

## タイトル

AIに丸投げしない開発術  
Codex Desktop / Claude Desktopで実践するハーネスエンジニアリング入門

## 対象

AIコーディングに慣れていないエンジニア。

## ゴール

参加者が以下を実践できる状態を目指す。

1. AIにいきなり実装させず、まずコードベースを調査させる
2. 実装前に計画を出させ、その計画を人間がレビューする
3. 仕様・制約・完了条件を明確にした依頼をする
4. テストを先に作らせ、失敗テストを通す形で実装させる
5. AGENTS.md / CLAUDE.md を使って、プロジェクト固有のルールをAIに渡す
6. AIの差分をレビューし、マージ前に人間が確認すべき観点を洗い出す

## 中心メッセージ

AIコーディングの品質は、モデルの賢さだけではなく、人間が用意したハーネスで決まる。

ここでいうハーネスとは、AIが安全に作業するための以下の仕組み。

- 仕様
- 制約
- テスト
- lint
- 差分レビュー
- 実装前の計画
- 変更可能な範囲
- 禁止事項
- 完了条件

## 推奨タイムテーブル

| 時間 | 内容 |
|---:|---|
| 0〜10分 | 目的説明・AIコーディングの基本思想 |
| 10〜25分 | 悪い例デモ |
| 25〜60分 | Codex Desktop編 |
| 60〜95分 | Claude Desktop編 |
| 95〜110分 | ハーネスエンジニアリング解説 |
| 110〜120分 | 現場導入テンプレ共有・質疑 |

## 事前準備

```bash
npm install
npm test
npm run lint
git status
```

`git status` は clean にしておく。

## 悪い例デモ

CodexまたはClaudeに以下を実行させる。

```text
Read and execute tasks/00-bad-example.md.
```

参加者に聞く。

```text
この差分をそのままPRにできますか？
```

見るポイント。

| 観点 | 確認内容 |
|---|---|
| 仕様 | ランク条件を勝手に決めていないか |
| 設計 | controller / service の責務分離を守っているか |
| テスト | 境界値テストを書いているか |
| 異常系 | 負数・小数・未指定を扱っているか |
| 検証 | npm test / npm run lint を実行しているか |
| 差分 | 不要なファイルを変更していないか |

悪い例デモ後は変更を破棄する。

```bash
git restore .
```

## Codex Desktop編

Codex Desktopは、作業スレッドを立ててAIに作業を委任し、差分をレビューして受け取る感覚が強い。

進め方。

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

説明ポイント。

- 1タスク1スレッドが基本
- AGENTS.mdで共通ルールを渡す
- 仕様はdocs/specsに分離する
- test / lint / diff reviewまで行わせる
- AIレビューは人間レビューの代替ではない

## Claude Desktop編

Claude Desktopでは通常ChatではなくCodeタブを使う。

最初に以下を入力する。

```text
Please read CLAUDE.md and confirm the project rules you will follow.
Do not edit files.
```

その後、Codexと同じくtasksを順番に実行する。

```text
Read and execute tasks/01-inspect-and-plan.md.
Stop after reporting the plan.
Do not edit files.
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

説明ポイント。

- Claudeは対話的にコード理解・設計・計画を詰めるのに向いている
- いきなり実装させず、まず調査と計画をさせる
- CLAUDE.mdは強制設定ではなくコンテキスト
- 最終責任は人間が持つ

## ハーネスエンジニアリングの説明

AIに「いい感じに作って」と言うのではなく、以下を渡す。

```text
この仕様で
この範囲だけ触って
このテストを通して
このコマンドで検証して
この観点で差分レビューして
危険な操作は止めてください
```

## 共通の禁止事項

```text
- .env を貼らない
- APIキーを貼らない
- 本番DB情報を渡さない
- migrationを勝手に実行させない
- rm -rf 系を安易に許可しない
- npm packageを勝手に追加させない
- 生成コードをレビューなしでマージしない
- 顧客コードを外部AIに入れてよいか契約・社内ルールを確認する
- DBスキーマ変更は必ず人間の承認を挟む
- 本番環境に接続できる状態でAIに自由作業させない
```

## 最後のまとめ

CodexとClaudeのどちらが上か、という話ではない。

Codexは、作業をスレッド化して委任し、diffで受け取る感覚が強い。  
Claudeは、対話しながらコード理解・設計・実装方針を詰める感覚が強い。

ただし、本質は同じ。

AIにコードを書かせる前に、仕様・制約・テスト・完了条件・レビュー観点を渡す。

AI開発の品質は、モデルの賢さだけではなく、人間が用意したハーネスで決まる。
