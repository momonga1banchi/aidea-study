# 12. flow-rebuild版 深掘り修正案

対象: `aidea-workshop-20260626-flow-rebuild/`

この文書は、2026-06-16の追加フィードバックを踏まえ、11案をさらに見直した修正案である。まだPPTX、生成スクリプト、デモプロジェクトには反映しない。

## 1. 今回の追加問題

11案では、用語、レイアウト、デモごとの増分を整理した。しかし、まだ次の不足がある。

1. Demo 2のcharacterization testについて、具体的にどうAIへ依頼するのかが弱い。
2. ある程度複雑なシステムで、どこまで既存挙動を固定すればよいかの判断基準がない。
3. 既存挙動を固定した後、仕様変更時にcharacterization testをどう扱うのかが説明されていない。
4. Demo 3の「controllerに業務ロジック直書き」は現実味が薄く、センサーを足すための作為に見える。
5. Demo 3からDemo 4への移行で、Guides / Sensors / Steering の責務と色分けが一貫していない。
6. Demo 5がループエンジニアリングとして何を増やし、人間が何をするのかを説明できていない。

## 2. 全体方針

Demo 1〜5のお題は引き続き一貫させる。

> 送料無料条件を5,000円以上から7,000円以上へ変更したい。

ただし、各デモの役割を次のように明確化する。

| Level | 役割 | 何を増やすか |
|---:|---|---|
| L1 | 足場なしで変更する | 何も増やさない。根拠不足を確認する |
| L2 | 既存挙動を固定する | characterization testとテスト観点表 |
| L3 | 変更しやすい構造を保証する | 送料無料ポリシー責務の記述とpolicy boundary sensor |
| L4 | 新仕様へ変更し、リリース候補にする | CR、AGENTS.md、受け入れテスト、spec/ADR/worklog |
| L5 | 途中介入を減らす | ループ状態、完了契約、停止条件、completion-report |

重要な変更は、Demo 3を「controller直書きの検出」から **送料無料ポリシーの責務を守るセンサー** に変えること。

これにより、同じお題のまま次の筋が成立する。

1. Demo 2で今の挙動を固定する。
2. Demo 3で、その挙動を変えずに、送料無料判定の責務を一箇所へ寄せる。
3. Demo 4で、7,000円への仕様変更をその責務境界の内側で行う。
4. Demo 5で、その作業ループをAIに任せる入口と出口を設計する。

## 3. Demo 2: characterization testの説明を深くする

### 3.1 伝えるべき定義

スライド上では、characterization testを次のように定義する。

> characterization test = 正しい仕様を決めるテストではなく、変更前の現在の振る舞いを観測して固定するテスト。

注意点として、次も明記する。

> 既存挙動を永久に正しいものとして固定するのではない。意図しない変化を検出するための基準線である。

### 3.2 AIへの依頼方法

現在の「テストを作ってください」だけでは粗い。

次のように、まず観点一覧を出させてからテスト化する流れにする。

```text
現在の注文見積もりAPIの挙動を調査し、
既存挙動を固定するcharacterization testを作成してください。

ただし、いきなりテストを書かず、先に以下の観点表を出してください。

1. 公開インターフェース
   - API endpoint
   - request / response shape
2. 変更対象に近い可変ポイント
   - 送料無料境界値
   - 送料
   - 送料無料までの残額
   - 表示メッセージ
3. 不変条件
   - shippingFeeが0ならfreeShippingRemainingも0
   - total = subtotal + shippingFee
   - appliedRulesとmessageが矛盾しない
4. エラーケース
   - 空items
   - 不正quantity
   - unknown sku
5. docsと実挙動の差分
   - docs/specsの記述と実レスポンスが違う場合は記録する

観点ごとに、テスト化する/しない、理由、確認方法を表にしてください。
その後、採用した観点だけをテストにしてください。
```

これにより、聴衆は「AIにどう頼めばよいのか」を持ち帰れる。

### 3.3 複雑なシステムでどこまで押さえるか

全部をテスト化するのではなく、変更対象の周辺をリスクベースで押さえると説明する。

スライドには次の表を出す。

| 観点 | 押さえる理由 | 今回の例 |
|---|---|---|
| 公開契約 | 呼び出し側を壊さないため | `POST /orders/estimate` のレスポンス形式 |
| 境界値 | 仕様変更で最も壊れやすい | 4999 / 5000 |
| 不変条件 | 値同士の矛盾を捕まえる | 送料0円なら残額0円 |
| 代表ケース | 全ケース網羅の代替 | 小計100円、4999円、5000円、12000円 |
| 既知の癖 | 現実の挙動を残す | docsは3,000円、コードは5,000円 |

話す内容:

- 既存システム全体を一気に固定しない。
- 今回変える業務ルールの周辺だけをまず固定する。
- 細かいprivate関数より、公開APIと業務上の境界値を優先する。
- 「網羅」ではなく「変更で壊れたら困る観点」を選ぶ。

### 3.4 仕様変更後にcharacterization testはどうなるか

ここは必ず説明する。

既存挙動テストは、仕様変更後に3種類へ分かれる。

| 種類 | 扱い | 今回の例 |
|---|---|---|
| 変えてはいけない挙動 | そのまま回帰テストとして残す | レスポンス形式、不正入力、total計算 |
| 意図して変える挙動 | 新仕様の受け入れテストへ書き換える | 5000境界 -> 7000境界 |
| 古い挙動の記録 | worklogやADRへ移す | docsは古かった、閾値が重複していた |

用語は「本当のユースケーステスト」よりも、次の呼び方がよい。

- 変更前: `characterization test`
- 変更後: `新仕様の受け入れテスト` または `acceptance/regression test`

話す内容:

> characterization testは、変更前の地図です。仕様変更後は、残すもの、書き換えるもの、記録へ移すものに分けます。古い挙動を守り続けるためのものではありません。

### 3.5 Slide 14 / 15の修正案

Slide 14:

- タイトル: `Demo 2: まず観点を出し、既存挙動を固定する`
- 左: AIへの依頼文テンプレート
- 右: 観点表
  - 公開契約
  - 境界値
  - 不変条件
  - エラーケース
  - docs差分
- 下: `このテストは、次のリファクタと仕様変更の安全網になる`

Slide 15:

- タイトル: `characterization testは、あとで3つに分かれる`
- 表:
  - 残す
  - 書き換える
  - 記録へ移す
- ここでDemo 3へ接続:
  - `挙動を固定したので、次は挙動を変えずに構造を整える`

## 4. Demo 3: センサー題材を作り直す

### 4.1 現在案の問題

`controllerに業務ロジックを直書きする悪い変更` は、分かりやすいが不自然に見える。

参加者が熟練プログラマーなら、次のように感じる可能性が高い。

- そんな変更は普通しない。
- センサーを見せるために無理やり悪い例を作っている。
- 今回の送料無料条件変更と直接つながっていない。

### 4.2 Demo 3の新しい位置づけ

Demo 3は、同じ送料無料テーマのまま次の役割に変える。

> Demo 2で既存挙動を固定した。Demo 3では、挙動を変えずに送料無料判定の責務を一箇所へ寄せ、今後の仕様変更で重複が増えないようにセンサー化する。

つまりDemo 3は、仕様変更前の **準備リファクタ + policy boundary sensor** とする。

これなら、プログラマーにも必要性が伝わりやすい。

### 4.3 新Demo 3のAIへの指示

```text
送料無料判定の責務を整理してください。

条件:
- 外部APIの挙動は変えない
- 既存のcharacterization testは全て通す
- 送料無料条件の判定は1つのpolicy moduleに集約する
- orderEstimateServiceとpromotionServiceが別々に閾値判断を持たないようにする
- 完了後に npm run sensors を実行してください
```

### 4.4 Demo 3で増やすもの

候補:

```text
src/services/freeShippingPolicy.js
docs/architecture/order-estimate-boundaries.md
scripts/check-policy-boundary.js
scripts/run-sensors.js
```

`freeShippingPolicy.js` の責務:

- `isFreeShipping(subtotal)`
- `freeShippingRemaining(subtotal)`
- `FREE_SHIPPING_THRESHOLD` は `config/pricing.js` から読む

`orderEstimateService.js` の責務:

- 見積もりを組み立てる
- 送料判定はpolicyへ委譲する

`promotionService.js` の責務:

- メッセージや残額表示を作る
- 閾値そのものは持たない

### 4.5 新しいセンサー内容

`architecture sensor` という名前のままでもよいが、スライド上では `policy boundary sensor` と説明する。

チェック内容:

| チェック | 目的 |
|---|---|
| `FREE_SHIPPING_THRESHOLD` の参照先がpolicy/configに限定される | 閾値の読み取り場所を絞る |
| `5000` / `7000` の業務閾値リテラルが実装に増えない | 仕様変更時の取り漏れを防ぐ |
| `promotionService` が独自のthresholdを持たない | Demo 1の矛盾原因を再発させない |
| `orderEstimateService` がpolicyを通して送料無料判定する | 送料と残額の判断源を揃える |
| controllerはHTTP変換のみ | これは補助チェックに下げる |

重要なのは、controller直書きではなく **同じ業務ルールが複数箇所へ分裂しないこと** を主役にすること。

### 4.6 Demo 3の見せ方

見せる順:

1. Demo 2のテストがある状態を確認する。
2. AIに「挙動を変えずに送料無料ポリシーを集約して」と依頼する。
3. `node --test` が緑で、挙動が変わっていないことを確認する。
4. `npm run sensor:policy-boundary` が緑で、責務境界が守られていることを確認する。
5. optionalで、`promotionService.js` に再び `const threshold = 5000` を入れる悪い差分を見せ、テストは通る可能性があるがpolicy sensorが赤になると示す。

### 4.7 Slide 16 / 17の修正案

Slide 16:

- タイトル: `Demo 3: 挙動を変えずに、送料無料ポリシーを一箇所へ寄せる`
- 左: AIへの指示
- 中央: 増える構造

```text
src/services/freeShippingPolicy.js
  isFreeShipping()
  freeShippingRemaining()

orderEstimateService
  policyを呼ぶ

promotionService
  policyを呼ぶ
```

- 右: sensorで守ること
  - 閾値判断を分裂させない
  - 実装内に業務閾値リテラルを増やさない
  - メッセージと送料が同じpolicyを見る

Slide 17:

- タイトル: `Demo 3で、仕様変更の前に構造の逃げ道を塞いだ`
- 表:

| Demo 2後 | Demo 3後 |
|---|---|
| 振る舞いは固定できた | 振る舞いを変えずに責務を整理 |
| 閾値の重複は残る | 送料無料policyが一箇所に集まる |
| 次の変更で取り漏れが怖い | policy boundary sensorが再分裂を止める |

Demo 4への接続:

> ここまでで、既存挙動の安全網と、送料無料ルールの置き場所ができた。次に、CRで7,000円への仕様変更を行う。

## 5. Demo 4: characterization testから新仕様テストへの移行を見せる

### 5.1 現在案の問題

Demo 4で仕様変更する際、Demo 2で作ったcharacterization testがどう扱われるのかが見えない。

参加者は次の疑問を持つ。

- 5000円で送料無料というテストは、7,000円へ変更したらどうするのか。
- テストを直すのは、AIが都合よく緑にしているだけではないのか。
- どのテストは残して、どのテストは変えるのか。

### 5.2 Demo 4で必ず見せる表

Slide 18または19に、次の表を入れる。

| Demo 2のテスト | Demo 4での扱い | 理由 |
|---|---|---|
| 4999円 -> 送料500円 | 6999円 -> 送料500円へ変更 | 境界値が仕様変更対象 |
| 5000円 -> 送料無料 | 7000円 -> 送料無料へ変更 | 境界値が仕様変更対象 |
| レスポンス形式 | 残す | API契約は変えない |
| total = subtotal + shippingFee | 残す | 不変条件 |
| shippingFeeとmessageの整合 | 残す | 不変条件 |
| 不正入力 | 残す | 仕様変更対象外 |

この表があると、characterization testが「都合よく書き換えられた」のではなく、CRに基づいて分類されたと説明できる。

### 5.3 Demo 4で追加するGuides

Guidesは青で統一する。

表示するもの:

```text
AGENTS.md
- 変更前に関連箇所を全文検索する
- 既存テストを勝手に削除しない
- 仕様変更対象のテストはCRに紐づけて更新する
- 送料無料判定はfreeShippingPolicyに置く

Change Request
- 6,999円 -> 送料500円
- 7,000円 -> 送料0円
- APIレスポンス形式は変えない
- UI、DB、税計算は対象外
```

### 5.4 Demo 4で追加するSteering

Steeringはオレンジで統一する。

表示するもの:

```text
worklog.md
- 何を変更したか
- docsと実装の乖離
- 残リスク

ADR
- 送料無料policyを一箇所に集約する判断
- 今後の変更時の参照先

diff review
- CRの受け入れ条件と一致するか
- 仕様変更対象外を触っていないか
```

### 5.5 色分けルール

今後のスライドでは、色を責務に固定する。

| 色 | 意味 | 例 |
|---|---|---|
| 青 | Guides | AGENTS.md, CR, architecture doc |
| 緑 | Sensors | tests, typecheck, policy boundary, レスポンス形式チェック |
| オレンジ | Steering | diff, worklog, ADR, completion-report |
| 赤 | NG / risk | failed sensor, remaining risk |

このルールにより、AGENTS.mdがSteering色になるような混乱をなくす。

### 5.6 Slide 18〜21の修正案

Slide 18:

- タイトル: `Demo 4: CRに基づいて、既存挙動テストを新仕様へ切り替える`
- 左: CRの受け入れ条件
- 右: Demo 2テストの扱い表

Slide 19:

- タイトル: `赤は失敗ではなく、意図した仕様変更の入口`
- 表示:
  - 旧5000境界テストが赤
  - 新6999/7000受け入れテストを追加
  - 最終センサーgreen

Slide 20:

- タイトル: `人間・AI・機械の責務`
- 今回の具体例で表示
  - 機械: 6999/7000、レスポンス形式、policy boundary
  - AI: 赤の原因調査、テスト分類、実装修正
  - 人間: CR解釈、テスト分類の妥当性、残リスク

Slide 21:

- タイトル: `送料無料条件変更は、リリース候補になった`
- 表示:
  - 機能: green
  - レスポンス形式: green
  - policy boundary: green
  - 記録: spec / ADR / worklog
  - 現場で残る: CI、本番相当データ、監視、ロールバック

## 6. Demo 5: ループエンジニアリングとして再設計する

### 6.1 現在案の問題

Demo 5は「入口と出口に絞る」と言っているが、何を設計したからそうできるのかが弱い。

ループエンジニアリングとして見せるなら、次を説明する必要がある。

- AIが何を読んでループを開始するのか。
- 赤になったとき、どこに状態を記録するのか。
- 何回まで回してよいのか。
- どの条件で止まるのか。
- 人間はいつ、何を見るのか。

### 6.2 用語定義

スライド上では、次のように定義する。

> ループエンジニアリング = AIが「赤を読む -> 原因を仮説化する -> 修正する -> 再実行する」を安全に回すために、状態、停止条件、出口報告を設計すること。

### 6.3 Demo 5で増やすもの

| 追加物 | 役割 | 色 |
|---|---|---|
| front-matter付きCR | AIが読む完了契約 | Guides / 青 |
| change-package sensor | CRの未達成項目を赤にする | Sensors / 緑 |
| loop-state.md | 各反復の状態を残す | Steering / オレンジ |
| completion-report.md | 人間が出口で読む報告 | Steering / オレンジ |
| escalation-report.md | 停止条件に達した時の報告 | Steering / オレンジ |

### 6.4 front-matterに何を書くか

```yaml
status: in_progress
acceptance:
  - test
  - typecheck
  - policy-boundary
  - response-shape
  - change-package
expected_behaviors:
  - 6999円 -> shippingFee 500
  - 7000円 -> shippingFee 0
required_artifacts:
  - spec
  - ADR
  - worklog
  - acceptance test
out_of_scope:
  - UI変更
  - DB変更
  - 税計算
max_iterations: 5
```

### 6.5 loop-stateに何を書くか

```text
iteration | red sensor | cause hypothesis | next action | result
0 | change-package | 受け入れテストとdocsが未作成 | テスト追加、spec更新 | red
1 | test | 6999円の期待値が旧仕様 | テスト分類をCRに合わせる | red
2 | policy-boundary | promotionServiceに閾値が残る | policyへ委譲 | green
3 | all | - | completion-report作成 | green
```

### 6.6 人間がすること

Demo 5で人間の仕事を必ず表示する。

開始前:

- CRのacceptanceを承認する。
- out_of_scopeを決める。
- max_iterationsを決める。
- 停止条件を決める。

実行中:

- 原則見ない。
- ただし停止条件に達したらescalation-reportを見る。

終了後:

- completion-reportを読む。
- diffを見る。
- 残リスクと人間確認項目を確認する。
- マージ可否を判断する。

### 6.7 Slide 22 / 23の修正案

Slide 22:

- タイトル: `Demo 5: AIが回るループの契約を設計する`
- 左: front-matter付きCR
- 右: ループ設計の4要素
  - 入口: CR
  - 状態: loop-state
  - 停止: max_iterations / out_of_scope / 同一赤
  - 出口: completion-report

Slide 23:

- タイトル: `人間は入口を設計し、出口で判断する`
- 左: loop-stateの反復表
- 右: completion-reportで人間が読む項目
  - CR-ID
  - 反復回数
  - 全センサー結果
  - 変更ファイル一覧
  - 残リスク
  - 確認すべき点

## 7. 全体のスライド再構成案

28枚構成を維持する場合、次のように差し替える。

| Slide | 修正後の役割 |
|---:|---|
| 10 | L0-L5全体像 |
| 11 | 題材と不足物 |
| 12 | Demo 1: 足場なしの指示とプロジェクト状態 |
| 13 | テストなしでは証明できない |
| 14 | Demo 2: characterization testの依頼方法と観点表 |
| 15 | characterization testは仕様変更後に3分類される |
| 16 | Demo 3: 送料無料policyを一箇所に寄せる |
| 17 | policy boundary sensorで再分裂を止める |
| 18 | Demo 4: CRに基づき新仕様テストへ切り替える |
| 19 | 赤から緑: 旧境界から新境界へ |
| 20 | 人間・AI・機械の責務 |
| 21 | 送料無料条件変更はリリース候補になった |
| 22 | Demo 5: ループ契約を設計する |
| 23 | loop-state / completion-reportで入口と出口を管理 |
| 25 | 足りないものがどう埋まったか |

## 8. 実装への影響

この案を本当に通すなら、スライド修正だけでは足りない。

### 8.1 変更が必要な可能性が高いもの

- `scripts/build-flow-rebuild-deck.mjs`
- `docs/workshop/facilitator-guide.md`
- 各 `instructor-notes.md`
- PPTX本体とQA画像
- `rework-verify.js`
- Demo 3のproject構成
- Demo 3 / Demo 4 / Demo 5の `instructor-materials/`

### 8.2 Demo 3のプロジェクト変更案

Demo 3以降のprojectには、次を追加または変更する。

```text
src/services/freeShippingPolicy.js
scripts/check-policy-boundary.js
docs/architecture/order-estimate-boundaries.md
```

`promotionService.js` と `orderEstimateService.js` は、policyを利用する形へ寄せる。

Demo 2までは現状の重複が残っていてよい。Demo 3で挙動を変えずに構造を整える、という流れにする。

### 8.3 Demo 4の素材変更案

Demo 4の赤出力は、旧境界値テストが赤になるものへ変える。

例:

```text
RED: expected free shipping at 5000, but CR changes threshold to 7000
ACTION: classify old boundary test as behavior-to-change
ADD: 6999 paid / 7000 free acceptance tests
GREEN: test / policy-boundary / response-shape
```

これにより、「AIが重複を見つけた」だけではなく、「characterization testを新仕様に沿って分類した」ことを見せられる。

## 9. 検収観点

修正後は次を確認する。

- Characterization testの依頼方法がスライド上にある。
- 複雑なシステムでどこまでテスト化するかの判断基準がある。
- 仕様変更時に、characterization testが残す/変える/記録へ移すに分類されている。
- Demo 3がcontroller直書きの不自然な例ではなく、送料無料policyの責務境界を扱っている。
- Demo 3からDemo 4への接続が「挙動固定 -> 構造整理 -> 仕様変更」になっている。
- Guidesは青、Sensorsは緑、Steeringはオレンジで一貫している。
- Demo 5に、front-matter付きCR、change-package sensor、loop-state、completion-report、停止条件、人間の役割がある。

## 10. 推奨判断

今回の指摘を踏まえると、単に11案を実装するだけでは不十分。

推奨は次の通り。

1. 11案の用語・レイアウト修正は採用する。
2. Demo 2は、characterization testの依頼方法とテスト分類の説明を追加する。
3. Demo 3は、controller直書き検出を主役から外し、送料無料policyの責務境界センサーへ変更する。
4. Demo 4は、characterization testを新仕様の受け入れテストへ分類・移行する話を入れる。
5. Demo 5は、ループエンジニアリングとして、状態、停止条件、出口報告、人間の役割を具体化する。

この方向なら、プログラマーが見ても「Demo 3は必要だ」と納得しやすい。
