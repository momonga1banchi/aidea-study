# AIdea勉強会 2026/06/26 資料

テーマ: AI時代のテスト自動化入門 〜AIエージェントに安全に開発を任せるためのハーネスエンジニアリング〜

## 使い方

```bash
bash scripts/verify-kit.sh
bash scripts/create-fresh-run.sh
```

生成された `runs/<timestamp>/<demo-unit>/project` を新規エージェントセッションで開く。
`instructor-prompts/` と `instructor-materials/` は作業ディレクトリへ入れない。

## デモ一覧

- 01_no_harness: ハーネスなしでAIに依頼する。
- 02_characterization: 既存挙動を固定するテストを作る。
- 03_architecture_sensor: テスト緑でも構造違反をセンサーで止める。
- 04_with_full_harness: CR、AGENTS.md、テスト、センサーを揃えて仕様変更する。
- 05_autonomous_loop: ボーナス。完了契約を渡して入口と出口だけ人間が見る。

## LIVE実演の安全策

- 各デモは独立している。前のデモ結果に依存しない。
- 実演は必ず `create-fresh-run.sh` でコピーした一時ディレクトリで行う。
- LIVEが詰まったら各demo-unitの `instructor-materials/success-log.txt` または `autonomous-loop-log.txt` へ切り替える。
