# 03. ハーネス仕様(センサー契約・AGENTS.md正文・テンプレート)

## 3.1 sensor契約(共通規約)

- 緑なら exit 0 で1行サマリ、赤なら exit 1 で「ファイル/原因/期待値」を1問題1行で出力する。
- 出力は日本語または英語どちらでもよいが、**スライドに載るため簡潔で読みやすいこと**(スタックトレースの垂れ流し禁止)。
- 期待値・ファイル名のハードコード禁止。設定(またはdemo 05ではCRのfront-matter)から読む。

| sensor | コマンド | 仕様 |
|---|---|---|
| test | `node --test` | 全テスト実行 |
| lint | `node scripts/lint.js` | src/scripts/testsを走査: タブ文字、行末スペース、`console.log`(scripts以外)、`var ` を検出 |
| typecheck | `node scripts/typecheck.js` | `tsc --noEmit`(checkJs)。tsconfig同梱 |
| architecture | `node scripts/check-architecture.js` | 下記3.2 |
| schema | `node scripts/check-schema.js` | サーバをin-processで起動しPOST /orders/estimateを実打 → レスポンスのキー集合・型を snapshots/api-schema.json と比較 |
| change-package | `node scripts/check-change-package.js` | 下記3.3。**demo 05のprojectにのみ同梱** |

`npm run sensors`(run-sensors.js): 上記を順次実行し、`| sensor | status | durationMs |` の表で出力。1つでも赤なら赤sensorの詳細を再掲して exit 1。
個別実行用に `npm run sensor:architecture` 等のscriptsも定義する。

## 3.2 architecture sensor(このワークショップの目玉)

「テストが緑でも構造が壊れている」を機械検出する。Demo 3の主役。ルールは決定的(deterministic)であること:

1. **依存方向**: `src/controllers/**` は `src/services/**` 以外のsrc内モジュール(repositories, config)をrequireしてはならない。`src/services/**` は `src/controllers/**` と `node:http` をrequireしてはならない。requireグラフを正規表現+パス解決で機械抽出する。
2. **コントローラーの業務ロジック禁止**: `src/controllers/**` 内の100以上の数値リテラル、および `subtotal`/`price`/`threshold` を含む算術式・比較式を検出して赤。
3. **重複閾値の増殖禁止**: `FREE_SHIPPING` 系の数値定義が `src/config/` の外に**新規追加**されたら赤——ただし既存の promotionService.js の1箇所は既知の負債として `scripts/architecture-allowlist.json` で許容する(罠を壊さないため)。allowlistの存在自体が「現実のプロジェクトには既知の負債がある」という説明素材になる。

赤出力例(この形式で実装する):

```
[architecture] NG: src/controllers/orderController.js:18 数値リテラル 7000 (業務閾値はsrc/config/pricing.jsへ)
[architecture] NG: src/controllers/orderController.js:3 controllersからrepositoriesへのrequireは禁止
```

## 3.3 change-package sensor(demo 05専用・汎用インタプリタ)

1. `docs/change-requests/*.md` を走査し、front-matterの `status: in_progress` または `implemented` のCRを対象にする(approvedは対象外)。
2. 各CRについて `required_artifacts` の存在と `must_include` を検証。`expected_behaviors` は moduleをrequireしてcallを実行し、expectの各キーを照合。
3. `status: implemented` のCRは全項目緑が必須。`in_progress` は未充足項目を列挙する(これが「残作業リスト」としてループを駆動する)。

## 3.4 Change Request 形式

### Demo 4用(散文+軽量メタデータ)

`docs/change-requests/CR-2026-06-26-free-shipping-threshold.md`。聴衆が読んで一目で分かる散文中心:

```markdown
# 送料無料閾値を7,000円以上へ変更する

- 依頼日: 2026-06-26 / 依頼者: 事業部
- 背景: 配送コスト上昇のため、送料無料ラインを5,000円から7,000円へ引き上げる。
- 受け入れ条件(人間が読む形):
  - 小計6,999円 → 送料500円
  - 小計7,000円 → 送料0円
  - APIレスポンスの形式は変えない
  - 「あと◯円で送料無料」の表示金額も新閾値に追随する
- 対象外: UI変更、税計算、DBスキーマ
- 完了の定義: 全テスト・全センサー緑 + 仕様書とADRの更新 + worklog記録
```

### Demo 5用(機械可読な完了契約。front-matter付き)

```markdown
---
id: CR-2026-06-26-free-shipping-threshold
status: in_progress
acceptance: [test, lint, typecheck, architecture, schema, change-package]
expected_behaviors:
  - { module: "src/services/orderEstimateService.js", call: "estimateOrderBySubtotal", input: 6999, expect: { shippingFee: 500 } }
  - { module: "src/services/orderEstimateService.js", call: "estimateOrderBySubtotal", input: 7000, expect: { shippingFee: 0 } }
required_artifacts:
  - { kind: spec,    path: "docs/specs/order-estimate.md", must_include: ["7,000"] }
  - { kind: adr,     path_glob: "docs/decisions/ADR-*-free-shipping-threshold.md", must_include: ["CR-2026-06-26"] }
  - { kind: worklog, path: "docs/ai/worklog.md", must_include: ["CR-2026-06-26", "残リスク"] }
  - { kind: test,    path_glob: "tests/**/*threshold*.test.js" }
out_of_scope: ["UI変更", "DBスキーマ変更", "税計算"]
max_iterations: 5
---

# 送料無料閾値を7,000円以上へ変更する
(Demo 4と同じ散文をここに再掲)
```

## 3.5 AGENTS.md 正文

### Demo 4版(このまま使用)

```markdown
# AGENTS.md

このリポジトリでAIエージェントが作業するときの規約。

## 調査の原則

- docs/specs は古い可能性がある。現状の仕様はコードとテストから確認し、乖離を見つけたら docs/ai/worklog.md に記録する。
- 変更前に、変更対象の値・ロジックが複数箇所に存在しないか全文検索する。

## 守ること

- 変更対象は依頼(docs/change-requests/)に書かれた範囲に限定する。
- 既存のAPIレスポンス形式は変えない。
- コントローラーに金額計算・閾値判定を書かない。計算ロジックはservices/に置く。
- 業務上の数値(閾値・送料)は src/config/pricing.js に集約する。
- 作業の各段階で npm run sensors を実行し、全センサー緑を確認してから次へ進む。
- 既存テストを削除・改変しない。仕様変更で既存テストが落ちる場合は、変更せず人間に確認する。
- 判断に迷う場合は勝手に決めず確認する。

## 記録すること

- 仕様変更を実装したら docs/specs/ を現実に合わせて更新する。
- 設計判断をしたら docs/decisions/ にADRを追加する(テンプレートはADR-0001参照)。
- 作業の要約・発見した問題・残リスクを docs/ai/worklog.md に追記する。
```

### Demo 5版(上記に以下のセクションを追加)

```markdown
## ループプロトコル

1. docs/change-requests/ から status: in_progress のCRを読む。
2. docs/ai/loop-state.md に計画を書く(iteration 0)。
3. 新仕様のfailing test → 最小実装 の順で進める。
4. 各反復の最後に npm run sensors を実行する。
5. 赤があれば loop-state に {iteration, 赤sensor, 原因要旨, 次の方針} を追記し、修復して再実行する。
6. 全センサー緑になったら docs/ai/code-review.md のチェックリストで自己レビューし、
   docs/ai/completion-report.md を書き、CRを status: implemented に更新し、
   最後に npm run sensors を再実行して停止する。

## 停止条件(該当したら docs/ai/escalation-report.md を書いて停止)

- CRの max_iterations に到達した。
- 同一sensorが同一原因で2回連続赤(進捗なし)。
- out_of_scope に触れる変更が必要だと判明した。
- 完了報告(completion-report)には: CR-ID / 反復回数 / 全sensor結果表 /
  変更ファイル一覧と各変更の一行理由 / 残リスク / 人間が確認すべき点(3項目以内)を書く。
```

`CLAUDE.md` は `@AGENTS.md` 参照+Claude固有の補足(あれば)のみ。

## 3.6 docs/ai/ テンプレート

- `worklog.md`: 「日付 / 依頼 / やったこと / 発見した問題 / 残リスク」の見出しだけの空テンプレート。
- `code-review.md`: 自己レビューチェックリスト(変更範囲は依頼内か / レスポンス形式不変か / 閾値の参照元は1箇所か / docsは現実と一致したか / テストは新仕様を固定したか)。
- `loop-state.md`(demo 05のみ): iterationテーブルの空テンプレート。
- ADR-0001: 「estimate APIの層構造(controller/service/repository/config)と依存方向」を記した実物。ADRテンプレートを兼ねる。
