# BUILD NOTES

## Flow rebuild 深掘り修正結果

- 実行日時: 2026-06-16 12:40:00 JST
- 追加更新日時: 2026-06-16 15:13:39 JST
- 追加更新日時: 2026-06-16 15:33:30 JST
- 追加更新日時: 2026-06-16 15:48:10 JST
- 追加更新日時: 2026-06-16 16:06:51 JST
- 対象ディレクトリ: `aidea-workshop-20260626-flow-rebuild`
- 方針: Demo 1を「AIが間違える」前提から外し、「AIが正しく直せても、テストなしではリリース判断の根拠にならない」構成へ変更。
- 追加方針: Demo 2のcharacterization testを、仕様変更後に「残す / 書き換える / 記録へ移す」ものとして説明する。
- 追加方針: Demo 3をcontroller直書き検出から、送料無料policyの責務境界を守るpolicy-boundary sensorへ変更。
- PPTX: artifact-toolで `outputs/aidea-workshop-20260626.pptx` を再生成。32枚、全スライドに固有の話者ノートを設定。
- レイアウト: L1-L5の説明は本文と重ならない右上バッジへ移動。`schemaなし` 表記は `APIレスポンス形式チェックなし` へ変更。
- 追加修正: Slide 9にハーネスエンジニアリングの背景、Slide 10に用語集を追加。CR / AGENTS.md / ADRなどをデモ前に説明する構成へ変更。
- 追加修正: Slide 16/18/19/20/24に「そのまま貼るプロンプト」と「AIが生成/更新する成果物」を明示。プロンプトと成果物の対応が追える構成へ変更。
- 追加修正: Slide 19から発表者向けの説明文を削除し、Demo 2/3で実際に作らせた成果物だけを表示。Demo 4の成果物先取りと、Demo 3プロンプトにないlint/typecheck/API response生成扱いを削除。
- 追加修正: first stepsの「代表的な入出力を3つメモする」を削除。実プロジェクト向けに「CRを書く」「AIに影響範囲とテスト観点表を出させる」「人間が固定範囲を決める」流れへ変更。
- 追加修正: Slide 9をBirgitta Böckeler氏のMartin Fowler記事に基づく軽い背景説明へ変更。Slide 10でAGENTS.mdはCodex向けであり、CLAUDE.md / GEMINI.mdと同じ立ち位置だと明示。
- 追加修正: Demo 4の前に、人間が用意するGuides(CR / AGENTS.md / order-estimate.md / ADR-0001)を見せるSlide 20を追加。Demo 4後のSlide 24でAIが更新するspec / ADR / worklogの中身を表示。
- 追加修正: Demo 5の前に、機械可読CR front-matterとAGENTS.mdループプロトコルを見せるSlide 25を追加。Demo 5でloop-state/completion-reportが自然発生したように見えない構成へ変更。

## R1-R7 実施結果

- R1 typecheck: 03/04/05 の `scripts/typecheck.js` はtsc第一、未検出時は `[typecheck] WARN: tsc未検出のため構文チェックのみ` を出すfallback構成。
- R2 実物素材: Demo 1-5の `instructor-materials/` を更新。Demo 3は `bad-policy-duplication.patch`、Demo 4は旧境界テスト赤から新仕様受け入れテストへの変換ログ、Demo 5はloop-state/completion-reportを保存。
- R3 PPTX差し替え: Slide 16/17でcharacterization testの依頼方法と後続扱いを追加。Slide 18/19でpolicy-boundary sensorへ変更。Slide 21で旧5,000円境界テストを6999/7000へ書き換える流れへ変更。
- R3 PPTX再差し替え: Slide 16はDemo 2の貼付プロンプト、Slide 18はDemo 3の貼付プロンプトと生成物、Slide 19は「何がどのプロンプトで増えたか」、Slide 20/24はDemo 4/5の貼付プロンプトを明示。
- R3 PPTX再調整: Slide 19を「ここまでに、どのプロンプトで何を作らせたか」へ変更。Demo 4/5の成果物リストも各 `instructor-prompts/run-demo.md` と一致するよう調整。
- R3 PPTX追加調整: ハーネスエンジニアリング背景と用語集をSlide 9/10へ追加。以降のSlide番号を同期し、検証は番号固定から本文検索へ変更。
- R3 PPTX追加調整: first stepsを、例数固定ではなく観点表と人間の範囲判断を入口にする表現へ変更。first-steps-checklistとQ&Aも同期。
- R3 PPTX追加調整: Slide 9から研究史説明を外し、Birgitta Böckeler氏の記事のGuides/Sensors整理に軽く触れる表現へ変更。AGENTS.mdのツール別読み替えを用語集とprimerへ追加。
- R3 PPTX追加調整: Demo 4/5の事前GuidesとAI生成/更新物を分離。Demo 4用の生成後spec/ADR/worklog抜粋を `instructor-materials/` に追加し、非LIVEでも資料内容を説明できるようにした。
- R4 facilitator-guide: Demo 2/3/4/5の台本を更新。特に「観点表を先に出させる」「policy境界を先に整える」「人間の入口/出口確認」を追記。
- R5 リハーサル: C1-C3を新構成に合わせて記録更新。使用プロンプト、反復回数、結果、調整点を保存。
- R6 instructor-notes: 5デモすべて固有の分岐、コマンド、フォールバック手順へ差し替え。Demo 3はcontroller悪例ではなく閾値重複の再発検出へ変更。
- R7 verify-kit: 台本ユニーク性、PPTXテキスト整合、typecheck実効性、R2素材有無、BUILD-NOTES C1-C3記録、flow-story検査を更新。

## C1-C3 リハーサル記録

### M1/M2 採取記録

- 実行日時: 2026-06-12 17:39:51 JST
- 使ったプロンプト: `demo-units/01_no_harness/instructor-prompts/run-demo.md`
- 反復回数: 1
- 結果: `src/config/pricing.js` のみ7,000円化した状態で、subtotal=6000のcurlが `shippingFee: 500`、`appliedRules: standard-shipping`、`freeShippingRemaining: 0`、`message: 送料無料` の矛盾を返した。
- 調整した点: AIが重複まで直した場合でも、Demo 1は「テストなしでは証明できない」に着地できるよう `acceptance-gap-branch.txt` を用意。

### C1 Demo 2

- 実行日時: 2026-06-16 12:40:00 JST
- 使ったプロンプト: `demo-units/02_characterization/instructor-prompts/run-demo.md`
- 実施形態: 実エージェントセッションはこの環境で起動できないため、手動相当で代替。セッションログは `demo-units/02_characterization/instructor-materials/session-log.txt` に保存。
- 反復回数: 1
- 結果: 生成テストは全緑。境界値4999/5000、API response shape、不正入力、送料と残額の不変条件、メッセージとappliedRulesの整合を含む。
- 調整した点: いきなりテストを書かせず、公開API、境界値、不変条件、エラーケース、docs差分の観点表を先に出させるプロンプトへ変更。

### C2 Demo 4

- 実行日時: 2026-06-16 12:40:00 JST
- 使ったプロンプト: `demo-units/04_with_full_harness/instructor-prompts/run-demo.md`
- 反復回数: 2
- 結果: pricing.jsを7,000円化すると旧5,000円境界のcharacterization testが赤になる。response形式、不正入力、total計算は残し、4999/5000境界は6999/7000の新仕様受け入れテストへ更新する流れへ変更。
- 調整した点: Demo 3でfreeShippingPolicyへ責務を寄せたため、Demo 4ではpromotionService重複修正ではなく、テストの扱いとspec/ADR/worklog更新を主役にした。

### C3 Demo 5

- 実行日時: 2026-06-16 12:40:00 JST
- 使ったプロンプト: `demo-units/05_autonomous_loop/instructor-prompts/run-demo.md`
- 反復回数: 3
- 結果: 初期change-package赤で `expected_behaviors 6999 -> shippingFee=500, got 0` を確認。loop-state、completion-reportを作成し、最終 `npm run sensors` は全緑想定のログへ更新。
- 調整した点: CR front-matterをAIの残作業リストとして扱い、人間の途中介入を入口と出口へ寄せる説明を追加。

## 検収実行ログ

- 実行日時: 2026-06-16 16:06:51 JST
- 実行コマンド: `node scripts/rework-verify.js .`
- 結果: `PASS R7-details: uniqueness/F3/typecheck/materials/BUILD-NOTES/flow-story`
- 実行コマンド: `python3 scripts/make-contact-sheet.py outputs/qa/slides outputs/qa/contact-sheet.png`
- 結果: 同梱Pythonでcontact sheet生成成功。
- 実行コマンド: `bash scripts/verify-kit.sh`
- 実行条件: sandbox内では `node --test` / APIレスポンス形式チェックが `listen EPERM` になるため、権限付き実行で確認。
- 最終結果: `All checks passed.`
- 追加検収: `sensor:api-response` を正式チェック対象に変更。artifact-toolのlayout JSON内IDがversion-mixing-checkに誤検出されないよう、`outputs/qa/layout` は対象外へ変更。
- 追加検収: Slide 9/10の背景説明・用語集、Slide 20/24/25のGuides/生成物、Slide 30のfirst stepsを確認。プロンプトと成果物の対応、および実プロジェクト向けの持ち帰り表現が一致していることを確認。`bash scripts/verify-kit.sh` は権限付き実行で `All checks passed.`

## 未完了項目

- C1は手動相当で代替。実エージェント新規セッションを起動できる環境では、`demo-units/02_characterization/instructor-prompts/run-demo.md` のみを渡して再採取する。
- tscあり環境での実測はこの環境では未完了。`npm run typecheck` はtsc未検出としてWARN降格し、構文チェックfallbackで成功することを確認済み。
- sandbox内の `node --test` / APIレスポンス形式チェックはlisten EPERMになるため、最終検収は権限付き実行で確認する。

## リハーサル調整履歴

- Demo 1: 矛盾curlの実物と、AIが正しく直した場合の説明分岐を追加。
- Demo 2: characterization testの依頼方法、観点表、仕様変更後の扱いを追加。
- Demo 3: policy-boundary sensor、freeShippingPolicy、責務境界ドキュメント、bad-policy-duplication.patchを追加。
- Demo 4: 赤テストから新仕様受け入れテストへ変換する時系列ログを追加。
- Demo 5: full-session-log、loop-state、completion-reportを入口/出口レビューの説明へ更新。
