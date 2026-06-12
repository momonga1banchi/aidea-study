# 04. デモユニット仕様(状態マトリクス)

各demo-unitは `instructor-notes.md` / `instructor-prompts/run-demo.md` / `project/` を持つ。
projectは02のコードベースをベースに、以下の差分だけを適用する。

**鉄則: before状態とは「これからAIにやらせる作業が残っている状態」。完了後にしか存在し得ないファイル(生成済みテスト、更新済みspec/ADR、worklog実績、completion-report、loop-state実績)をbefore状態に入れたら不合格。**

## 状態マトリクス

| 項目 | 01_no_harness | 02_characterization | 03_architecture_sensor | 04_with_full_harness | 05_autonomous_loop |
|---|---|---|---|---|---|
| 役割(時間) | 問題提起(4分) | テスト化(6分) | 構造センサー(4分) | ★中心: 仕様変更(6分) | ボーナス: 全部任せる(0-5分) |
| src閾値 | 5000 | 5000 | 5000 | 5000 | 5000 |
| tests/ | **無し** | **無し**(snapshotsも無し) | 有り(全緑) | 有り(全緑) | 有り(全緑) |
| scripts/(sensors) | 無し | 無し | 有り(change-package除く) | 有り(change-package除く) | 有り(change-package含む) |
| package.jsonのscripts | test/sensors定義なし | test/sensors定義なし | 同梱センサーに一致 | 同梱センサーに一致 | 同梱センサーに一致 |
| AGENTS.md / CLAUDE.md | 無し | 無し | 無し | 有り(Demo4版) | 有り(Demo5版=ループ規約付き) |
| docs/specs(古い3,000円) | 有り | 有り | 有り | 有り | 有り |
| ADR | ADR-0001のみ | ADR-0001のみ | ADR-0001のみ | ADR-0001のみ | ADR-0001のみ |
| change-request | 無し | 無し | 無し | 有り(散文版) | 有り(front-matter版, in_progress) |
| docs/ai/ | 無し | 無し | 無し | worklog/code-review空テンプレ | +loop-state空テンプレ |
| 初期センサー状態 | — | — | 全緑 | 全緑 | **change-packageのみ赤**、他全緑 |
| 期待される終わり方 | AIは「できました」、curlで矛盾発覚 | 既存挙動テスト一式が緑で完成 | テスト緑のままarchitectureが赤→修正で緑 | 罠で赤→AI修復→全緑→人間が記録を確認 | 介入ゼロでcompletion-report到達 |

## 各ユニットの規定

### 01_no_harness — 「AIは修正してくれる。でも何をもってOK?」

- プロンプト: 「送料無料の条件を5,000円以上から7,000円以上に変更してください。」(これだけ。前提情報を渡さない)
- **期待される筋書き**: AIはpricing.jsの閾値だけを変更して「できました」と報告する可能性が高い(promotionService.jsの重複ハードコードに気づかない)。テストが無いので確認手段がない。
- 発表者の種明かし: `node src/server.js` を起動し `curl` で `subtotal=6000` を投げる → `shippingFee: 500` なのに `message: "送料無料"` という矛盾レスポンスを見せる。
- 伝えること: 問題はAIの性能ではなく、**AIの出力を受け入れる根拠が無いこと**。人間が全部curlで確認するなら、AIで速くなった分が確認で消える。
- instructor-notes必須分岐: AIが偶然promotionServiceの重複まで直してしまった場合 → 「今回は気づいたが、何をもって『全部直った』と言えるか?」に話を切り替え、specが3,000円のまま古いことを見せて同じ結論へ着地する手順を書く。

### 02_characterization — 「まず、今の振る舞いを固定する」

- プロンプト: 「現在の注文金額計算APIの挙動を調査し、既存挙動を固定するテスト(characterization test)を作成してください。仕様書は古い可能性があるため、コードと実際のレスポンスを根拠にしてください。境界値と、送料とメッセージの整合性を必ず含めてください。」
- 期待される成果: testHelper+unit/integrationテスト一式(02の不変条件テストを含む内容)。閾値5,000の境界(4999/5000)を固定。
- **古い仕様書の見せ場**: AIがspecの「3,000円」とコードの「5,000」の乖離に言及したら最良。しなければ発表者が「仕様書には3,000円と書いてあります。どちらが正しい?」と聴衆に問いかけ、「docsではなく挙動を固定する」意義を説明する。
- 伝えること: 既存コードが完璧かは一旦置く。「今の動きが変わっていないか」を機械が答えられる状態を作るのが第一歩。これが以後すべてのデモの足場(Sensors)になる。
- instructor-notes: AIのテスト生成は時間が読めないため、**完成済みテスト一式を手元に用意しておき、生成が3分を超えたら「先に結果をお見せします」と差し替える**手順を明記。

### 03_architecture_sensor — 「動けばOKではなく、構造も守る」

- 進行: AI実演ではなく**発表者が確実に再現できる形**にする。instructor-promptsに「悪い変更」依頼文を用意: 「orderController.jsの中で、subtotalが10,000円以上のとき送料を0にする特急対応を直接書いてください。テストは通る形で。」(AIにやらせてもよいし、用意済みパッチ `instructor-materials/bad-controller.patch` を当ててもよい。両方同梱する)
- 見せる順: ①変更後 `node --test` → **緑**(振る舞いは壊れていない) ②`npm run sensor:architecture` → **赤**(コントローラー内の数値リテラル+ロジック)。
- 伝えること: テストが緑でも構造が壊れることがある。構造の約束(層の責務・依存方向)も機械チェックにすると、AIの「動くけど雑な実装」を抑制できる。これもSensorsの一種。
- instructor-notes: allowlist(promotionServiceの既知の負債)の説明を一言入れる(「現実のプロジェクトには既知の負債がある。センサーは新しい違反だけ止める」)。

### 04_with_full_harness — ★本編の山場「ハーネスありで仕様変更する」

- プロンプト: 「AGENTS.mdを読んだ上で、docs/change-requests/CR-2026-06-26-free-shipping-threshold.md の変更を実装してください。各段階でセンサーを実行し、全部緑になったら仕様書・ADR・worklogを更新して完了報告してください。」
- **期待される筋書き(instructor-notesに必ず記載)**:
  1. AIがAGENTS.mdの調査原則に従い全文検索 → 理想は最初から重複を発見。
  2. 発見せずpricing.jsだけ変更した場合 → `npm run sensors` で不変条件テストが赤 → AIが赤を読み、promotionServiceの重複を発見して統一 → 全緑。**こちらの方がデモ映えする**(センサーが間違いを捕まえる瞬間が見える)。
  3. 全緑後、spec更新(3,000円の古い記載も7,000円に修正)・ADR追加・worklog記録。
- 人間(発表者)の役割を明示的に演じる: 完了報告とdiffを見て「仕様解釈は正しいか」「記録は残ったか」だけを確認する(Steering)。全コードを目視しない。
- 伝えること: Guides(AGENTS.md+CR)→ Sensors(テスト+architecture+schema)→ Steering(人間の確認と記録)が一周する。確認の大部分が機械化され、人間は判断に集中できる。
- instructor-notes必須分岐: AIが一発で両方直した場合(赤が出ない)→「もしpricing.jsだけ直していたら?」と手元の録画 or 用意済みの赤出力スクショで罠を説明する手順。時間超過時にどこで切り上げるか。

### 05_autonomous_loop — ボーナス「完了契約を渡して、全部任せる」

- **カット可能設計**: 時間が押したらスライドごと飛ばす。LIVEが不安なら事前録画(または出力ログの静止画)で見せる。録画/ログの採取は制作時に行い `instructor-materials/` に同梱する。
- プロンプト(3行であることを聴衆に見せる): 「AGENTS.mdに従い、CR-2026-06-26-free-shipping-threshold を処理してください。人間へ返すのは、completion-report完成時または停止条件該当時のみです。途中で質問しないでください。」
- CRを `in_progress` で出荷する理由: 開始時点で `npm run sensors` がchange-package赤(=残作業リスト)を出し、「赤から始まりAIが緑にして終わる」物語を作るため。
- 期待される筋書き: Demo 4と同じ罠を、今度は人間の介入ゼロで AIが loop-state に記録しながら2反復以上で突破し、completion-report を書いて停止する。
- 伝えること: Demo 4との差は**介入回数**(都度確認 vs 入口1回+出口1回)。任せる範囲はハーネスの整備度で決まる、という締めの主張につなげる。
- instructor-notes: LIVE実施時の分岐(max_iterations超過時、ループが1反復で終わった時)と、録画再生時の進行スクリプトの両方を書く。

## instructor-notes.md の必須記載事項(全ユニット共通)

1. このデモで証明したいこと(1-2文)
2. 開始前チェック(実行するコマンドと期待出力)
3. 進行手順(貼るプロンプト、見せる画面、言うセリフの要点)
4. 期待される結果と、そうならなかった場合の分岐
5. 所要時間と省略可能ポイント

## LIVE実演の安全策(README/facilitator-guideに記載)

- 実演時は対象projectのみを `create-fresh-run.sh` で一時ディレクトリへコピーして `git init` し、新規エージェントセッションで開く。
- instructor-prompts/ と instructor-materials/ はAIの作業ディレクトリに入れない(answer keyの混入防止)。
- 各デモは独立して開始できる(前のデモの結果に依存しない)。
- 全デモ分の「成功時の画面録画またはターミナルログ」を制作時に採取して同梱し、LIVE失敗時の即時フォールバックにする。
