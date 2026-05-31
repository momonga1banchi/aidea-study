# AGENTS.md

## 言語

- 回答・説明・差分要約・レビュー結果は日本語で書く。
- コード識別子、ファイル名、コマンド名、HTTP API名は既存の英語表記を維持する。

## プロジェクト概要

これは、社内AIコーディング勉強会用の Express + Jest API プロジェクトです。

最初からあるAPI：

- `GET /health`
- `GET /tax?price=1000`

今回追加するAPI：

- `GET /discount?amount=50000`

## アーキテクチャ

- `src/routes/` はURLとcontrollerの対応づけのみを行う。
- `src/controllers/` はHTTPのrequest / response処理のみを行う。
- `src/services/` はビジネスロジックを置く。
- controllerに会員ランク判定などのビジネスロジックを書かない。
- 今回の課題ではDBアクセスを追加しない。

## 実行コマンド

- 依存関係のインストール: `npm install`
- テスト: `npm test`
- lint: `npm run lint`
- 起動: `npm start`

## 作業ルール

- まず関連ファイルを調査する。
- 非自明な変更では、実装前に計画を出す。
- タスクが「まだ実装しない」と指示している場合、ファイルを編集しない。
- 振る舞いを変える場合は、テストを追加または更新する。
- 明示的な承認なしに依存packageを追加しない。
- 既存のpublic API response formatを勝手に変更しない。
- 無関係なファイルを変更しない。
- `.env` や `secrets/` は読まない。

## 完了条件

- 関連テストが通る。
- `npm run lint` が通る。
- 変更差分をレビューする。
- 残リスクと人間が確認すべき点を列挙する。
