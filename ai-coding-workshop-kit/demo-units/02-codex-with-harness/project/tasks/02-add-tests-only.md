# Task 02: テストだけ追加

## 読むファイル

- `AGENTS.md` または `CLAUDE.md`
- `docs/specs/member-discount.md`

## タスク

会員ランク割引APIのテストを追加する。

## 重要

まだ本番コードは実装しない。  
このタスクでは、テストだけを追加する。

## 追加するテストケース

- `amount=0` は `bronze`, `0`
- `amount=9999` は `bronze`, `0`
- `amount=10000` は `silver`, `0.03`
- `amount=49999` は `silver`, `0.03`
- `amount=50000` は `gold`, `0.05`
- `amount=99999` は `gold`, `0.05`
- `amount=100000` は `platinum`, `0.1`
- `amount` 未指定は400
- 数値ではない `amount` は400
- 負数の `amount` は400
- 小数の `amount` は400

## 作業後

1. `npm test` を実行する。
2. 追加したテストが失敗することを確認する。
3. 各テストが何を保証しているか、日本語で説明する。
