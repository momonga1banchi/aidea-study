# AIdea勉強会 2026/06/26 資料

テーマ: AI時代のテスト自動化入門 〜AIエージェントに安全に開発を任せるためのハーネスエンジニアリング〜

このディレクトリは、既存システムにAIで変更を入れるときに「何を根拠にリリースOKと言えるか」を段階的に見せる構成です。

## 使い方

```bash
bash scripts/verify-kit.sh
bash scripts/create-fresh-run.sh
```

生成された `runs/<timestamp>/<demo-unit>/project` を新規エージェントセッションで開く。
`instructor-prompts/` と `instructor-materials/` は作業ディレクトリへ入れない。

LIVEデモ中に、メニューまたは番号指定で `/private/tmp/project` を作り直してサーバ起動まで進める場合:

```bash
bash scripts/run-live-demo.sh
```

引数なしで実行すると、デモ1〜5、Codex実行後の再起動curl確認、「デモ完了」を選択できる。
再起動curl確認は、現在の `/private/tmp/project` をコピーし直さず、デモサーバだけを再起動して、7,000円条件の送料をcurlで確認する。
デモ完了を選ぶと、起動中のデモサーバを停止し、`/private/tmp/project` を削除する。
従来どおり番号を直接指定することもできる。

```bash
bash scripts/run-live-demo.sh 1
bash scripts/run-live-demo.sh 2
bash scripts/run-live-demo.sh 3
bash scripts/run-live-demo.sh 4
bash scripts/run-live-demo.sh 5
```

このスクリプトは、前回起動したデモサーバを停止し、`/private/tmp/project` を削除して、指定番号の `project` をコピーし、`npm install`、`npm run start`、`curl` による疎通確認、Codex Desktopへ貼るプロンプトのクリップボードコピーまで行う。
プロンプトは毎回 `/private/tmp/aidea-demo-prompt.txt` にも保存される。
疎通確認のJSONレスポンスは、`jq` があれば `jq`、なければNodeでpretty printする。
プロンプトコピーを止めたい場合は `AIDEA_COPY_PROMPT=0 bash scripts/run-live-demo.sh 1` のように実行する。
Codex実行後に現在の `/private/tmp/project` を再起動して確認する場合は `bash scripts/run-live-demo.sh --restart-check 7000` を使う。5,000円のまま確認したい場合は `bash scripts/run-live-demo.sh --restart-check 5000` を使う。
既定のURLは `http://127.0.0.1:31026`。停止だけ行う場合は `bash scripts/run-live-demo.sh --stop`、停止と `/private/tmp/project` 削除まで行う場合は `bash scripts/run-live-demo.sh --finish` を使う。
Codexなどの非対話実行でバックグラウンドプロセスが終了してしまう場合は、`AIDEA_DEMO_HOLD=1 bash scripts/run-live-demo.sh 1` のように実行し、デモ終了時に `Ctrl-C` で止める。

## デモ一覧

- 01_no_harness: テストなしで修正はできても、リリース根拠が残らないことを見る。
- 02_characterization: 既存挙動を固定し、以後の変更で壊れていない範囲を確認できるようにする。
- 03_architecture_sensor: 送料無料policyの責務境界をセンサーで止める。
- 04_with_full_harness: CR、AGENTS.md、テスト、センサー、記録でリリース候補を作る。
- 05_autonomous_loop: ボーナス。CR front-matter、loop-state、完了条件、停止条件で途中介入を減らす。

## LIVE実演の安全策

- 各デモは独立している。前のデモ結果に依存しない。
- 実演は必ず `create-fresh-run.sh` でコピーした一時ディレクトリで行う。
- LIVEが詰まったら各demo-unitの `instructor-materials/success-log.txt` または `autonomous-loop-log.txt` へ切り替える。

## 進行用資料

- `docs/workshop/facilitator-guide.md`: 説明内容の台本。
- `docs/workshop/live-presentation-script.md`: スライド、ターミナル、対象プロジェクト、Codex Desktopを切り替えるためのLIVE実行台本。
