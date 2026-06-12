# BUILD NOTES

## R1-R7 実施結果

- R1 typecheck: 03/04/05 の `scripts/typecheck.js` を差し替え。`TSC_TIMEOUT_MS` は10000msへ変更。tsc第一、未検出時は `[typecheck] WARN: tsc未検出のため構文チェックのみ` を出す動的列挙fallbackに変更。
- R2 実物素材: M1-M6を各 `instructor-materials/` に保存。curl、node --test、npm run sensorsはコマンド行付きの生ログ形式。
- R3 PPTX差し替え: F3対象スライドに採取物由来の行を反映。Slide 13と19は別内容。09_FIXでSlide 13/14/16/19/23の制作指示混入を除去し、話者ノートは28枚すべてスライド固有文へ再差し替え。
- R4 facilitator-guide: 8つの進行ブロックへ全面差し替え。想定質問セクションは維持。
- R5 リハーサル: C1-C3を新規エージェントセッション相当の独立作業として実施し、使用プロンプト、反復回数、結果、調整点を記録。
- R6 instructor-notes: 5デモすべて固有の分岐、コマンド、フォールバック手順へ差し替え。
- R7 verify-kit: 台本ユニーク性、F3整合、typecheck実効性、R2素材有無、BUILD-NOTES C1-C3記録、09_FIXのPPTX漏洩語句・ノート重複検査を追加。

## C1-C3 リハーサル記録

### M1/M2 採取記録

- 実行日時: 2026-06-12 17:39:51 JST
- 使ったプロンプト: `demo-units/01_no_harness/instructor-prompts/run-demo.md`
- 反復回数: 1
- 結果: `src/config/pricing.js` のみ7,000円化した状態で、subtotal=6000のcurlが `shippingFee: 500`、`appliedRules: standard-shipping`、`freeShippingRemaining: 0`、`message: 送料無料` の矛盾を返した。
- 調整した点: サンドボックス内の初回 `npm start` は `listen EPERM` のため、承認済み外部実行で採取。promotionService.jsに残る重複閾値5000が原因であることをM1/M2に明記。

### C1 Demo 2

- 実行日時: 2026-06-12 19:08:36 JST
- 使ったプロンプト: `demo-units/02_characterization/instructor-prompts/run-demo.md`
- 実施形態: 実エージェントセッションはこの環境で起動できないため、手動相当で代替。セッションログは `demo-units/02_characterization/instructor-materials/session-log.txt` に保存。
- 反復回数: 1
- 結果: 生成テストは全緑。`subtotal=4999` は送料500円、`subtotal=5000` は送料無料、レスポンススキーマ、不正入力、送料と残額の不変条件、メッセージとappliedRulesの整合を含む。
- 確認コマンド: `node --test`。`# tests 19`、`# pass 19`、`# fail 0` を `test-run-output.txt` に保存。
- 調整した点: 既存挙動固定を目的に、仕様書ではなくコードと実レスポンスを根拠にした。境界値4999/5000と不変条件を明示。

### C2 Demo 4

- 実行日時: 2026-06-12 17:27:45 JST
- 使ったプロンプト: `demo-units/04_with_full_harness/instructor-prompts/run-demo.md`
- 反復回数: 2
- 結果: pricing.jsのみ7,000円化して `not ok 7 - invariant: shippingFee === 0 iff freeShippingRemaining === 0` と `assert.ok(res.freeShippingRemaining > 0)` を採取。promotionService.js、仕様変更対象テスト、仕様書、ADR、worklogを一時コピー内で調整し、`npm run sensors` 全緑を採取。
- 調整した点: sandbox内の初回 `node --test` はlisten EPERMになるため、赤採取とsensorsは権限付きで実行。Slide 19とDemo 4 notesへ赤→緑の時系列を反映。

### C3 Demo 5

- 実行日時: 2026-06-12 17:20:22 JST
- 使ったプロンプト: `demo-units/05_autonomous_loop/instructor-prompts/run-demo.md`
- 反復回数: 3
- 結果: 初期change-package赤で `expected_behaviors 6999 -> shippingFee=500, got 0` を確認。loop-state、completion-reportを作成し、最終 `npm run sensors` は全緑。
- 調整した点: サンドボックスのlisten制限を避けるため権限付きでsensors採取。旧5,000円仕様のテスト期待値を一時コピー内で7,000円仕様へ更新。

## 検収実行ログ

- 実行日時: 2026-06-12 19:20:42 JST
- 実行コマンド: `bash scripts/verify-kit.sh`
- 実行条件: sandbox内では `node --test` / schema sensor が `listen EPERM` になるため、最終検収は権限付きで実行。
- typecheck結果: `tsc` 未検出環境のため `[typecheck] WARN: tsc未検出のため構文チェックのみ` を表示し、構文チェックfallbackで成功。`TSC_TIMEOUT_MS=10000`、typecheck検収枠は15秒。
- 最終結果: All checks passed. 09_FIX追加検査を含め全PASS。

## 未完了項目

- C1は手動相当で代替。実エージェント新規セッションを起動できる環境では、`demo-units/02_characterization/instructor-prompts/run-demo.md` のみを渡して再採取する。
- tscあり環境での実測はこの環境では未完了。`npm run typecheck` はtsc未検出としてWARN降格し、構文チェックfallbackで成功することを確認済み。
- sandbox内の `node --test` / schema sensor はlisten EPERMになるため、最終検収は権限付き実行で確認する。

## リハーサル調整履歴

- Demo 1: 矛盾curlの実物を追加。
- Demo 2: completed-testsとnode --test生ログを追加。
- Demo 3: patch適用、test緑、architecture赤の生ログを追加。
- Demo 4: 赤テストから全緑sensorsへの時系列ログを追加。
- Demo 5: full-session-log、loop-state、completion-report、C3新規セッション記録を追加。
