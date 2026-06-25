# Facilitator Guide

## 全体進行表

| 時間 | スライド | 内容 | デモ |
|---:|---|---|---|
| 0:00-0:04 | 1-2 | オープニング | - |
| 0:04-0:09 | 3-5 | 持ち帰り・問い | - |
| 0:09-0:20 | 6-13 | 考え方・用語・題材 | - |
| 0:20-0:27 | 14-15 | L1: テストなしの修正 | Demo 1 |
| 0:27-0:34 | 16-17 | L2: 既存挙動の固定 | Demo 2 |
| 0:34-0:41 | 18-19 | L3: policy境界センサー | Demo 3 |
| 0:41-0:54 | 20-24 | L4: リリース候補を作る | Demo 4 |
| 0:54-0:60 | 25-32 | L5とまとめ | Demo 5 |

## 進行の考え方

今回の軸は、AIが間違えるかどうかではない。既存システムにAIで変更を入れるとき、リリース判断に必要な材料をどう増やすかを見せる。

各デモの終わりで必ず次を確認する。

- 何ができるようになったか。
- それでも何が足りないか。
- 次のデモではどの不足を埋めるか。

この3点を飛ばすと、デモが個別の小技に見えてしまう。

## sensor実行範囲の前提

Codex Desktopのループ内で回す `npm test` / `npm run sensors` は、HTTPサーバのlistenに依存しないものに限定する。`server.listen()` や localhost fetch を使うIntegration Testは、環境によって `listen EPERM` で失敗するため、AIループ内には入れない。

説明は次で統一する。

- ループ内: unit / service / controller / in-process API shape / lint / typecheck / policy-boundary / change-package
- ループ外: 実サーバ起動、curl、Integration Test、E2E、CI、本番相当確認

`listen EPERM` が出た場合は、ポート衝突ではなくsensor設計の問題として扱う。sensorをin-process化し、実サーバ確認は人間またはCIの出口ゲートへ回す。

## セクションごとの台本

### 1. オープニング(Slide 1-2)

#### 言うこと

今日はテスト自動化の話から入ります。ただし、AIにテストコードを書かせるだけの話ではありません。AIが実装もテストもできるようになったとき、人間は何を見れば業務開発として受け入れられるのかを扱います。

AIdea勉強会の初回として、完璧な方法論を覚える場にはしません。既存システムにAIを入れるとき、どの順番で怖さを減らせるかを持ち帰ってもらいます。

今日のデモは、AIが失敗するところを笑う構成ではありません。AIがうまく直したとしても、リリース判断の根拠がないと現場では困る、という視点で見てください。

#### 見せる画面

- Slide 1でタイトルと日付を見せる。
- Slide 2で勉強会の位置づけを説明する。
- ターミナルにはまだ切り替えない。

#### 戻り方

そのままSlide 3へ進む。

### 2. 持ち帰り・問い(Slide 3-5)

#### 言うこと

今日持ち帰ってほしいのは、AIは実装者にもテスターにもなるが、受け入れ責任者にはならないという感覚です。受け入れ責任を人間が持つなら、AIが出した結果を何で確認するかを先に決める必要があります。

問いは単純です。テストが薄い既存システムで、送料無料ラインを5,000円から7,000円へ変えてとAIに頼んだあと、何を見てリリースOKと言えるでしょうか。

現場では、仕様書が古い、テストが少ない、コードの責務が混ざっている、レビュー時間が足りない、という問題が重なります。ここを一気に解決するのではなく、足りないものを順番に減らしていきます。

#### 見せる画面

- Slide 3: 持ち帰りを読み、受け入れ判断という言葉を強調する。
- Slide 4: 問いを出したあと、数秒だけ間を取る。
- Slide 5: よくある現場状況を、自分が関わっていない保守案件として想像してもらう。

#### 戻り方

Slide 6へ進み、テスト自動化の意味を広げる。

### 3. 考え方・用語・題材(Slide 6-13)

#### 言うこと

テスト自動化は、単にテストを書く作業の自動化ではありません。AIが変更したあとに、人間が判断する材料を自動で集めることです。

そのための足場を、今日はハーネスと呼びます。ここではBirgitta Böckeler氏がMartin Fowlerサイトの記事で整理している、coding agent利用者向けのハーネスエンジニアリングを背景にします。AIの賢さだけに期待するのではなく、作業前のGuidesと作業後のSensorsで、AIが出した変更を判断できる形にする考え方です。

言葉だけ聞くと難しく見えますが、今日はGuides、Sensors、Steeringの3つに絞ります。Guidesは作業前の前提、Sensorsは作業後の機械チェック、Steeringは人間の判断と記録です。CR、AGENTS.md、ADRなどの用語はSlide 10で一度そろえます。AGENTS.mdはCodex向けの名前で、Claude CodeのCLAUDE.mdやGeminiのGEMINI.mdと同じ立ち位置だと補足してください。

題材は小さな注文見積りAPIです。重要なのは題材の業務内容ではなく、既存システムらしい怖さです。テストが薄い、仕様書が古い、閾値が複数箇所にある。この状態から、足りないものをL0からL5へ順番に埋めていきます。

#### 見せる画面

- Slide 6-8: テスト自動化、AIエージェント、ハーネスの流れを説明する。
- Slide 9: Birgitta Böckeler氏の記事を背景に、ハーネスエンジニアリングを現場で必要になる理由として軽く説明する。
- Slide 10: CR、AGENTS.md、ADR、characterization test、Sensor、Steeringの意味を合わせる。
- Slide 11: Guides / Sensors / Steering の3要素を見せる。
- Slide 12: L0-L5の達成レベル表を見せる。
- Slide 13: 開始時点の不足物を示す。
- 必要ならターミナルで題材を確認する。

```bash
cd demo-units/04_with_full_harness/project
find src -maxdepth 3 -type f | sort
rg "3,000|5000|FREE_SHIPPING|threshold" docs src
```

#### 戻り方

Slide 14へ進む。ここから各デモの終わりに達成レベルへ戻ると予告する。

### 4. Demo 1: テストなしの修正(Slide 14-15)

#### 言うこと

最初は何も足場を置きません。AIに1文だけ渡し、送料無料ラインの変更を頼みます。ここでは、AIが間違えるかどうかを勝負にしません。

AIが片方だけ直したら矛盾が出ます。AIが両方直したら、今回はうまくいったと言えます。ただし、どちらの場合でも業務開発としてはまだ足りません。境界値、回帰、レスポンス形式、仕様書との乖離を次回も確認できる仕組みがないからです。

Demo 1の結論は、機能ができたかもしれない、でもリリース判断はできない、です。

#### 見せる画面

- Slide 14で1文プロンプトを見せる。
- ターミナルに切り替える。

```bash
cd demo-units/01_no_harness/project
rg "5000|FREE_SHIPPING|threshold" src docs
```

片方だけ修正した分岐を見せる場合:

```bash
perl -0pi -e 's/FREE_SHIPPING_THRESHOLD = 5000/FREE_SHIPPING_THRESHOLD = 7000/' src/config/pricing.js
HOST=127.0.0.1 PORT=31101 node src/server.js
curl -sS -X POST http://127.0.0.1:31101/orders/estimate \
  -H 'content-type: application/json' \
  -d '{"items":[{"sku":"UNIT-001","quantity":6000}]}'
```

LIVEでは必ずfresh-runのコピーで実行する。詰まったら `demo-units/01_no_harness/instructor-materials/contradiction-curl.txt` を表示する。

#### 戻り方

Slide 15へ戻る。`shippingFee":500` と `message":"送料無料"` は補助例として扱い、最後は「正しく直っても証明できない」に着地させる。

### 5. Demo 2: 既存挙動の固定(Slide 16-17)

#### 言うこと

次にAIへいきなり新仕様を実装させず、現在の振る舞いを固定させます。ここで作るcharacterization testは、既存コードが理想的であることを証明するものではありません。現在地を機械で再確認できるようにするものです。

依頼の仕方が重要です。Slide 16に出している文は、そのままAIへ貼るプロンプトです。「テストを書いて」ではなく、先に観点表を出させます。公開API、境界値、不変条件、エラーケース、docs差分のうち、何をテスト化し、何を記録に回すかを説明させます。

境界値4999/5000、レスポンス形式、不正入力、不変条件を固定します。ここから先のデモでは、このテストが入った状態を出発点にします。

Demo 2の結論は、既存挙動の破壊は検出できるようになった、でも送料無料判定が複数箇所へ分裂する構造や作業規約はまだ守れない、です。

#### 見せる画面

```bash
cd demo-units/02_characterization/project
rg "3,000|5000|FREE_SHIPPING" docs src
mkdir -p tests
cp ../instructor-materials/completed-tests/*.js tests/
node --test
```

AI生成が長引いたらcompleted-testsへ切り替える。切り替えるときは、LIVE成功より観点説明を優先すると言う。

#### 戻り方

Slide 17へ戻る。「characterization testは古い挙動を永久に守るものではありません。仕様変更時には、残すもの、書き換えるもの、記録へ移すものに分けます」と言う。続けて「では、仕様変更前に修正漏れを生む構造をどう減らすか」と言ってDemo 3へ進む。

### 6. Demo 3: policy境界センサー(Slide 18-19)

#### 言うこと

Demo 2のテストは、外から見える振る舞いを守ります。しかし、送料無料判定が複数のserviceへ分裂していると、次の仕様変更で修正漏れが起きやすくなります。

ここでは7,000円へ変えません。Slide 18のプロンプトを貼り、挙動を変えずに、送料無料判定、閾値取得、残額計算を `freeShippingPolicy.js` へ寄せるように依頼します。そのプロンプトの中で、境界ドキュメント、policy-boundary sensor、run-sensors登録まで作成対象として指定します。

つまり、`freeShippingPolicy.js` や `check-policy-boundary.js` は講師が突然出すものではありません。Demo 3のプロンプトでAIに生成させる成果物です。

ここで作る `test` と `api-response` sensorは、実サーバをlistenしないin-process確認にする。Integration TestはCIや人間の出口確認へ回す。

Demo 3の結論は、振る舞いだけでなく責務境界も見られるようになった、でもAIへ事前に渡すCRと、出口で人間が見るものはまだ足りない、です。

#### 見せる画面

```bash
cd demo-units/03_architecture_sensor/project
npm test
rg "5000|FREE_SHIPPING|freeShippingPolicy" src docs package.json
```

その後、Slide 18のプロンプトを貼り、Codexにpolicy module、責務境界ドキュメント、lint/typecheck/API response/policy-boundary sensor、run-sensors登録を作成させる。生成後に以下を見せる。

```bash
npm run sensors
sed -n '1,160p' src/services/freeShippingPolicy.js
sed -n '1,180p' docs/architecture/order-estimate-boundaries.md
sed -n '1,220p' scripts/check-policy-boundary.js
patch -p0 < ../instructor-materials/bad-policy-duplication.patch
node --test
npm run sensor:architecture
```

詰まったら以下を表示する。

```bash
less ../instructor-materials/red-output.txt
```

悪い差分でもnode --testは緑になる場合がある。そこからpolicy-boundaryだけが赤になる順番で見せる。振る舞いテストと責務境界センサーが別のリスクを見ていることが重要です。

#### 戻り方

Slide 19へ戻る。Demo 2とDemo 3で、どのプロンプトからどの成果物が作られたかだけを確認する。ここではDemo 4の成果物を先取りせず、「ここまでで既存挙動テストとpolicy境界センサーが揃った」と言ってAGENTS.mdとCRへ接続する。

### 7. Demo 4: リリース候補を作る(Slide 20-24)

#### 言うこと

ここが本編の山場です。同じ送料無料変更を、CR、AGENTS.md、古いspec、既存ADR、テスト、センサー、記録先が揃った状態で頼みます。狙いは、AIが正しく直すことだけではなく、人間がリリース候補としてレビューできる材料を揃えることです。

Slide 20では、AIに渡す前提を先に見せます。CRは人間が用意する変更依頼です。AGENTS.mdは作業規約です。order-estimate.mdは古い仕様を含む既存docsで、ADR-0001は既存の構造判断です。この4つが入口として置かれているから、AIは何を信じ、何を疑い、何を更新するかを判断できます。

ここではSlide 21のプロンプトを貼ります。Demo 2のcharacterization testをそのまま握りしめません。変えてはいけないレスポンス形式、不正入力、total計算は回帰テストとして残します。一方で、4999/5000境界のテストは6999/7000境界の新仕様受け入れテストへ書き換えます。古い挙動の理由やdocs差分はworklogやADRへ移します。

AIが一発で直した場合でも構いません。重要なのは、どのテストを残し、どれを書き換え、どの判断を記録したかを説明できることです。

Slide 24では、AIが更新・生成する資料の中身を見せます。order-estimate.mdは7,000円へ更新され、ADRはCRに対する設計判断を残し、worklogは発見した乖離と残リスクを残します。Demo 4の結論は、ワークショップ上はリリース候補まで到達した、ただし現場ではCI、本番相当データ、非機能、デプロイ、監視がまだ残る、です。

`npm run sensors` はCodexが自分で回せる軽量確認であり、実サーバcurlはCodex実行後に `demo --restart-check 7000` で人間が確認する。

#### 見せる画面

```bash
cd demo-units/04_with_full_harness/project
npm run sensors
rg "5000|7000|threshold|FREE_SHIPPING" src tests docs
less ../instructor-materials/red-to-green.txt
```

Slide 22では、古い境界値テストが赤になり、新仕様の受け入れテストへ書き換わって全緑になる流れを説明する。

#### 戻り方

Slide 24へ戻る。spec、ADR、worklogの中身を読み、リリース候補としてレビューできる材料が揃ったことを確認する。

### 8. Demo 5とまとめ(Slide 25-32)

#### 言うこと

最後はボーナスです。Slide 25で、自律ループの入口も人間が設計していることを見せます。機械可読CR、AGENTS.mdのループプロトコル、停止条件があるから、AIは途中で勝手に判断せず、loop-stateとcompletion-reportへ進行を残せます。

Slide 26のプロンプトを貼ります。完了条件と停止条件を機械可読にすると、人間の途中介入を減らせます。ただし、これはDemo 1から4で足場を増やしたから成立します。

自律ループの価値は、AIが勝手に進むことではありません。赤になった理由をloop-stateに残し、完了時にはcompletion-reportで人間が見るべき点を絞ることです。

Demo 5の重要点は、全部をAIループ内へ入れないこと。Integration TestやE2EはCIの受け入れゲートへ回し、AIはin-process sensorを全緑にしてcompletion-reportへ出口確認項目を残す。

まとめます。AIに任せるのではなく、AIに安全に任せられる状態を作る。最初にやることは大きな自律化ではありません。変更依頼をCRとして短く書き、AIに影響範囲とテスト観点表を出させ、人間が固定すべき既存挙動の範囲を決めることです。

#### 見せる画面

```bash
cd demo-units/05_autonomous_loop/project
npm run sensors
less ../instructor-materials/full-session-log.txt
less ../instructor-materials/completion-report.md
less ../instructor-materials/loop-state.md
```

Slide 27で入口、途中、出口に人間の確認点を寄せる図を見せる。

#### 戻り方

Slide 31へ進み、最後の一文をゆっくり読む。質疑では下のQ&Aへ戻る。

## 時間調整

- 時間圧縮のスキップ順: 25-27 → 18 → 5。
- 削らないスライド: 3, 4, 9, 10, 12, 15, 20, 22, 24, 31。
- Demo 5を飛ばす場合も、Slide 29で足りないものがどう埋まったかを確認する。
- Demo 3を飛ばす場合は、Slide 19でpolicy-boundary sensorの存在だけ触れる。

## 事前確認

- `node -v` が20系以上であること。
- `npx --no-install typescript tsc -v` が使えるか確認する。使えない場合、typecheckはWARN付きの構文チェックfallbackになる。
- 各デモは `scripts/create-fresh-run.sh` でコピーしてから開く。
- `instructor-prompts/` と `instructor-materials/` はAIの作業ディレクトリに入れない。
- LIVEが詰まったら、各 `instructor-materials/` のログを使う。

## 想定質問と答え

### Q1. AIがテストなしでも正しく直せるなら、Demo 1は何を見せているのですか?

AIの失敗ではなく、リリース判断の根拠不足を見せています。正しく直っても、次回も同じ観点を確認できる仕組みがなければ現場では不安が残ります。

### Q2. characterization testは、古い挙動を固定してしまう危険はありませんか?

あります。だから新仕様のテストではなく、現状把握のテストとして扱います。既存挙動を固定した上で、Change Requestによって変えるべき点を明示します。

### Q3. 仕様書が古い場合、AIには何を信じさせればよいですか?

最初はコードと実レスポンスを根拠に現在地を復元させます。乖離はworklogに残し、仕様変更時にspecを更新します。

### Q4. テストがAIによって都合よく書き換えられたらどうしますか?

既存テストの削除や無断改変をGuidesで禁止し、CIや差分レビューで検出します。重要なテストは変更理由を要求します。

### Q5. policy-boundary sensorは手作り感が強くありませんか?

現場ごとの守りたい責務境界をコード化するものなので、最初は手作りで構いません。unit、integration、contract、API差分、securityなどへ少しずつ育てます。

### Q6. 小さい変更でもADRやworklogは必要ですか?

大きな文書である必要はありません。なぜその判断をしたかを1行残すだけでも、次回のAI作業に効きます。

### Q7. Demo 4で全緑なら本当にリリースできますか?

ワークショップ上はリリース候補です。実プロジェクトではCI、本番相当データ、非機能、権限、デプロイ、監視の確認が残ります。

### Q8. 自律ループはすぐ現場で使うべきですか?

最初から目指さない方が安全です。まず既存挙動テストと軽いセンサーを作り、出口で人間が判断できる状態を作ってから範囲を広げます。

### Q9. JavaやPHPのプロジェクトでも同じですか?

同じ考え方を使えます。変わるのはセンサーの実装です。JUnit、PHPUnit、静的解析、OpenAPI差分など、現場の道具に置き換えます。

### Q10. 明日から何をすればよいですか?

まず変更依頼をCRとして短く書きます。次にAIへ、実装ではなく影響範囲、既存挙動、テスト観点、不明点の表を先に出させます。その表を人間が確認し、固定すべき既存挙動と対象外を決めてから、採用した観点だけをテスト化します。
