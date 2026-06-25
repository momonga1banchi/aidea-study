# デモ動画収録ガイド

ネットワークトラブルなどで当日Codex Desktopが使えない場合に備え、各デモを事前収録しておくための手順です。

各デモは次の4点を必ず撮ります。

1. 開始状態を見せる
2. デモスクリプトで環境準備し、プロンプトをコピーする
3. Codex Desktopへプロンプトを貼り付けて実行する
4. 完了後に成果物、センサー、curlで確認する

## 共通準備

作業ディレクトリ:

```bash
cd /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626
```

デモ開始:

```bash
bash scripts/run-live-demo.sh 1
```

`1` はデモ番号です。`1` から `5` まで指定できます。

このスクリプトは以下をまとめて行います。

- 既存のデモ用Nodeサーバを停止
- `/private/tmp/project` を削除
- 指定した `demo-units/<demo>/project` を `/private/tmp/project` へコピー
- `npm install`
- `npm run start` でサーバ起動
- `/health` と `/orders/estimate` をcurlで確認
- 対象デモのプロンプトをクリップボードへコピー

Codex Desktop実行後の確認:

```bash
bash scripts/run-live-demo.sh --restart-check 7000
```

Demo 2 / Demo 3 のように、まだ7,000円へ変更しない回は `5000` で確認します。

```bash
bash scripts/run-live-demo.sh --restart-check 5000
```

片付け:

```bash
bash scripts/run-live-demo.sh --finish
```

## 収録時の画面構成

推奨:

- デスクトップ1: スライド
- デスクトップ2: ターミナル
- デスクトップ3: Codex Desktop
- デスクトップ4: エディタまたはFinder

録画はデモ単位で分けると、当日差し替えやすいです。

ファイル名例:

```text
demo1-no-harness.mov
demo2-characterization.mov
demo3-architecture-sensor.mov
demo4-full-harness.mov
demo5-autonomous-loop.mov
```

## Demo 1: テストなしでAIに修正を頼む

### 目的

「AIが間違えること」を見せるデモではありません。

AIが正しく直せたとしても、テスト、仕様書更新、判断記録がない状態では、リリース判断の根拠が弱いことを見せます。

### 開始状態

```bash
bash scripts/run-live-demo.sh 1
cd /private/tmp/project
rg "3,000|5000|7000|FREE_SHIPPING" src docs
```

見るポイント:

- コードには5,000円の閾値がある
- 仕様書には古い3,000円の記述が残っている
- テストやセンサーはまだない

### Codexへ貼るプロンプト

```text
送料無料の条件を5,000円以上から7,000円以上に変更してください。
```

プロンプト元:

```text
demo-units/01_no_harness/instructor-prompts/run-demo.md
```

### 完了後に見るもの

```bash
rg "3,000|5000|7000|FREE_SHIPPING" src docs
bash /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/scripts/run-live-demo.sh --restart-check 7000
```

AIが片方だけ直した場合は、レスポンス矛盾を見せます。

期待される矛盾例:

- `shippingFee: 500`
- `message: "送料無料"`

AIが正しく両方直した場合も、失敗扱いにしません。その場合は次を見せます。

```bash
rg "3,000|5000|7000|FREE_SHIPPING" docs src
```

### 収録で言う着地点

- 今回は正しく直ったように見えるかもしれない
- しかし、次回も同じ確認ができる仕組みがない
- 手動curlはその場限りの確認で、継続的な証拠ではない
- Demo 1の状態ではリリース判断はできない

## Demo 2: 既存挙動をcharacterization testで固定する

### 目的

Demo 1で足りなかった「既存挙動を守る根拠」を作ります。

いきなり仕様変更に進まず、現在の挙動を調査し、characterization testとして固定するところを見せます。

### 開始状態

```bash
bash scripts/run-live-demo.sh 2
cd /private/tmp/project
rg "3,000|5000|FREE_SHIPPING" docs src
```

見るポイント:

- docsと実装が食い違っている
- AIには古いdocsだけでなく、コードと実挙動を根拠にさせる

### Codexへ貼るプロンプト

プロンプト元:

```text
demo-units/02_characterization/instructor-prompts/run-demo.md
```

重要な依頼内容:

- いきなりテストを書かない
- 先に観点表を出す
- 公開インターフェース、境界値、不変条件、エラーケース、docs差分を見る
- `server.listen()` や `localhost` に依存しないin-process testにする

### 完了後に見るもの

```bash
find tests -maxdepth 2 -type f | sort
node --test
bash /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/scripts/run-live-demo.sh --restart-check 5000
```

確認ポイント:

- 4999 / 5000 の境界値がある
- API response shapeを固定している
- 不正入力を確認している
- `total = subtotal + shippingFee` のような不変条件がある

### 収録で言う着地点

- 既存挙動はテストで守れるようになった
- ただし、構造の劣化はまだ止められない
- 7,000円への新仕様変更はまだしていない
- 次は、送料無料判定が複数箇所へ分裂する問題を扱う

## Demo 3: 送料無料policyの責務境界をセンサー化する

### 目的

Demo 2で外から見える振る舞いは固定できました。

しかし、送料無料判定が `orderEstimateService` と `promotionService` に分裂したままだと、次の仕様変更で修正漏れを生みやすくなります。

Demo 3では、挙動を変えずに `freeShippingPolicy` へ責務を寄せ、その境界をセンサーで守ります。

### 開始状態

```bash
bash scripts/run-live-demo.sh 3
cd /private/tmp/project
npm test
rg "5000|FREE_SHIPPING|freeShippingPolicy" src docs package.json
```

見るポイント:

- characterization testはある
- `freeShippingPolicy.js` はまだない
- `docs/architecture/order-estimate-boundaries.md` はまだない
- `scripts/run-sensors.js` や各種sensor scriptはまだない
- ここでは7,000円変更はしない

### Codexへ貼るプロンプト

プロンプト元:

```text
demo-units/03_architecture_sensor/instructor-prompts/run-demo.md
```

重要な依頼内容:

- 送料無料判定、閾値取得、残額計算を1つのpolicy moduleに集約する
- `orderEstimateService` と `promotionService` が別々に閾値判断を持たないようにする
- 責務境界ドキュメントを作る
- policy-boundary sensorを作る
- `npm run sensors` に登録する
- 追加npm packageには依存しない
- 色付きで見やすい `run-sensors.js` にする

### 完了後に見るもの

```bash
ls src/services scripts docs/architecture
sed -n '1,200p' src/services/freeShippingPolicy.js
sed -n '1,200p' docs/architecture/order-estimate-boundaries.md
npm run sensors
bash /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/scripts/run-live-demo.sh --restart-check 5000
```

余裕があれば、悪い例も収録します。

```bash
patch -p0 < /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/demo-units/03_architecture_sensor/instructor-materials/bad-policy-duplication.patch
node --test
npm run sensor:architecture
```

この順番が重要です。

1. `node --test` は緑
2. `npm run sensor:architecture` は赤

### 収録で言う着地点

- 振る舞いが同じでも、次の変更を危険にする構造はある
- テストだけでは構造劣化を止められない
- policy-boundary sensorで、次の仕様変更前に修正箇所を狭められた
- まだCR、AGENTS.md、ADR、worklogまでは揃っていない

## Demo 4: ハーネスありでリリース候補を作る

### 目的

Demo 1と同じ送料無料変更でも、CR、AGENTS.md、テスト、センサー、記録先が揃うと、AIの作業結果をリリース候補としてレビューできることを見せます。

ここで見るのはAIの賢さではなく、受け入れ判断に必要な材料が揃ったかです。

### 開始状態

```bash
bash scripts/run-live-demo.sh 4
cd /private/tmp/project
npm run sensors
sed -n '1,200p' AGENTS.md
sed -n '1,200p' docs/change-requests/CR-2026-06-26-free-shipping-threshold.md
rg "5000|threshold|FREE_SHIPPING" src tests docs
```

見るポイント:

- 開始時点では全センサー緑
- 5,000円の既存挙動はテストで固定されている
- CRには7,000円への変更条件がある
- AGENTS.mdには作業範囲、調査原則、記録ルールがある

### Codexへ貼るプロンプト

プロンプト元:

```text
demo-units/04_with_full_harness/instructor-prompts/run-demo.md
```

重要な依頼内容:

- AGENTS.mdを読む
- CRを実装する
- characterization testを「残すもの、書き換えるもの、記録へ移すもの」に分ける
- 4999 / 5000境界は、6999 / 7000の新仕様受け入れテストへ書き換える
- response形式、不正入力、total計算は回帰テストとして残す
- spec、ADR、worklogを更新する

### 完了後に見るもの

```bash
npm run sensors
rg "5000|7000|FREE_SHIPPING|threshold" src tests docs
ls docs/decisions docs/ai docs/specs
sed -n '1,200p' docs/specs/order-estimate.md
sed -n '1,200p' docs/ai/worklog.md
bash /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/scripts/run-live-demo.sh --restart-check 7000
```

確認ポイント:

- `src/config/pricing.js` が7,000円になっている
- 6999 / 7000 の境界テストがある
- 古い4999 / 5000の期待値が残っていない
- response形式、不正入力、total計算は回帰テストとして残っている
- ADR、spec、worklogが更新されている
- `npm run sensors` が全緑

### 収録で言う着地点

- ここで初めて、リリース候補として人間がレビューできる材料が揃う
- 人間は全コードを読むのではなく、CR、diff、センサー結果、ADR、worklog、残リスクを見る
- ただし、本番確認、CI、権限、監査ログ、監視は現場で追加が必要

## Demo 5: 完了条件と停止条件で途中介入を減らす

### 目的

Demo 4では、人間が途中の赤や修正方針を見ながら進めました。

Demo 5では、CRを機械可読にし、完了条件と停止条件を渡すことで、人間の介入点を入口と出口へ寄せられることを見せます。

### 開始状態

```bash
bash scripts/run-live-demo.sh 5
cd /private/tmp/project
npm run sensors
sed -n '1,220p' docs/change-requests/CR-2026-06-26-free-shipping-threshold.md
sed -n '1,240p' AGENTS.md
```

見るポイント:

- 開始時点で `change-package` が赤になる場合がある
- これは失敗ではない
- CRに対して、必要成果物と期待挙動がまだ満たされていないという残作業リストである

### Codexへ貼るプロンプト

プロンプト元:

```text
demo-units/05_autonomous_loop/instructor-prompts/run-demo.md
```

重要な依頼内容:

- `expected_behaviors` と `required_artifacts` を残作業リストとして扱う
- 赤になったセンサー、原因、次方針を `docs/ai/loop-state.md` に記録する
- `policy-boundary` sensorを壊さない範囲で実装する
- `server.listen()` や `localhost` に依存しない
- 実サーバcurl、Integration Test、E2Eは人間またはCIの出口確認として `completion-report.md` に残す
- 人間へ返すのは `completion-report` 完成時または停止条件該当時のみ
- 途中で質問しない

### 完了後に見るもの

```bash
npm run sensors
sed -n '1,240p' docs/ai/loop-state.md
sed -n '1,240p' docs/ai/completion-report.md
sed -n '1,220p' docs/change-requests/CR-2026-06-26-free-shipping-threshold.md
bash /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/scripts/run-live-demo.sh --restart-check 7000
```

確認ポイント:

- `expected_behaviors` と `required_artifacts` が残作業リストとして使われている
- 赤センサー、原因、次方針が `loop-state.md` に残っている
- `completion-report.md` に反復回数、センサー結果、変更ファイル、残リスク、人間が見る点がまとまっている
- CR statusが更新されている
- 最終的に `npm run sensors` が全緑

### 収録で言う着地点

- 自律ループは放任ではない
- 完了条件と停止条件つきの反復である
- 人間の責任は消えない
- 人間は入口でCRを承認し、出口でdiff、センサー、残リスク、記録を確認する

## LIVEが失敗した場合のフォールバック素材

Codex Desktopの応答が遅い、ネットワークが落ちた、期待通りに生成されない場合は、各デモの `instructor-materials/` を使って録画または当日説明に切り替えます。

### Demo 1

```text
demo-units/01_no_harness/instructor-materials/contradiction-curl.txt
demo-units/01_no_harness/instructor-materials/session-log.txt
```

### Demo 2

```text
demo-units/02_characterization/instructor-materials/test-run-output.txt
demo-units/02_characterization/instructor-materials/success-log.txt
```

### Demo 3

```text
demo-units/03_architecture_sensor/instructor-materials/red-output.txt
demo-units/03_architecture_sensor/instructor-materials/success-log.txt
demo-units/03_architecture_sensor/instructor-materials/bad-policy-duplication.patch
```

### Demo 4

```text
demo-units/04_with_full_harness/instructor-materials/red-to-green.txt
demo-units/04_with_full_harness/instructor-materials/generated-order-estimate.md
demo-units/04_with_full_harness/instructor-materials/generated-ADR-0002-free-shipping-threshold.md
demo-units/04_with_full_harness/instructor-materials/generated-worklog-excerpt.md
```

### Demo 5

```text
demo-units/05_autonomous_loop/instructor-materials/full-session-log.txt
demo-units/05_autonomous_loop/instructor-materials/loop-state.md
demo-units/05_autonomous_loop/instructor-materials/completion-report.md
```

## 収録チェックリスト

各動画の最後に、次を一言で締めます。

| Demo | 達成したこと | まだ足りないこと |
|---|---|---|
| Demo 1 | AIに変更依頼はできた | 証明、テスト、記録、仕様更新がない |
| Demo 2 | 既存挙動をテストで固定できた | 構造劣化や作業規約はまだ守れない |
| Demo 3 | 責務境界をセンサーで守れる | CR、Guides、ADR、worklogはまだ弱い |
| Demo 4 | リリース候補としてレビューできる材料が揃った | CI、本番確認、運用確認は残る |
| Demo 5 | 途中介入を減らし、入口と出口へ寄せられた | センサーが薄い領域は守れない |

重要な言い方:

- Demo 1は「失敗デモ」ではなく「証明できないデモ」
- Demo 2は「テストを増やした」ではなく「現在地を固定した」
- Demo 3は「センサーを足した」ではなく「構造劣化を止めた」
- Demo 4は「AIが実装した」ではなく「リリース候補としてレビュー可能になった」
- Demo 5は「AIに放任した」ではなく「完了条件と停止条件つきで反復させた」
