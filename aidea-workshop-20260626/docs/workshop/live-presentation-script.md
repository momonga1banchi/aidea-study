# LIVEプレゼン実行台本

この台本は、スライド、対象プロジェクト、ターミナル、Codex Desktopを切り替えながら進めるための手元用メモです。
`facilitator-guide.md` は説明内容の台本、このファイルは当日の画面操作を含む実行台本として使います。

## 進行の基本形

各デモは必ず同じ型で進める。

1. スライドで「この段階で何が足りないか」を言う。
2. ターミナルで `scripts/run-live-demo.sh` を実行し、`/private/tmp/project` をその段階のプロジェクトに差し替える。この時点でCodex Desktopへ貼るプロンプトもクリップボードへ入り、`/private/tmp/aidea-demo-prompt.txt` にも保存される。
3. 対象プロジェクトの中身を30秒から60秒だけ見せる。
4. Codex Desktopでプロンプトを貼る、または準備済みログ・成果物を見せる。
5. スライドへ戻り「何が達成できたか、まだ何が足りないか」を回収する。

重要: デモ番号を再実行すると `/private/tmp/project` は作り直される。Codexが変更した後に同じ番号を再実行すると作業結果が消える。Codex実行後にWebサーバを反映したい場合は、デモ番号ではなく `demo --restart-check 7000` またはメニューの6番を使う。

## 推奨するLIVE配分

全部をCodexでLIVE生成すると、待ち時間と失敗時の説明が大きくなる。60分枠なら次の配分が現実的。

| デモ | 推奨 | 理由 |
|---|---|---|
| Demo 1 | Codex LIVE可 | 1文依頼なので短い。AIが正しく直しても「証明できない」に着地できる。 |
| Demo 2 | Codex LIVE推奨 | 観点表を先に出させる体験が重要。 |
| Demo 3 | 成果物確認 + 悪い差分のsensor実演推奨 | 生成過程より「振る舞いテストでは見えない構造リスクを止める」ことが重要。 |
| Demo 4 | Codex LIVE推奨 | CR、AGENTS.md、テスト、センサー、記録がつながる本編。 |
| Demo 5 | 時間があればCodex LIVE、基本はログ確認 | 自律ループは長くなりやすい。入口と出口の設計を見せれば十分伝わる。 |

## 事前準備

発表前に以下を済ませる。

```bash
cd /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626
bash scripts/verify-kit.sh
bash scripts/run-live-demo.sh --finish
```

ターミナルには次の関数とaliasを貼っておく。

```bash
cd /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626
alias demo='bash scripts/run-live-demo.sh'

copy_prompt() {
  awk '/^```$/{inside=!inside; next} inside {print}' "$1" | pbcopy
}

show_project() {
  find /private/tmp/project -maxdepth 3 -type f \
    | sort \
    | sed 's#^/private/tmp/project/##' \
    | sed -n '1,90p'
}

show_shipping_refs() {
  rg -n "5000|7000|FREE_SHIPPING|freeShipping|shippingFee|freeShippingRemaining" \
    /private/tmp/project/src /private/tmp/project/tests /private/tmp/project/docs 2>/dev/null || true
}
```

通常は `demo` 実行時にプロンプトが自動コピーされる。貼り直したい場合だけ、次のように手動でコピーする。

```bash
copy_prompt demo-units/04_with_full_harness/instructor-prompts/run-demo.md
```

## 画面配置

可能なら画面は4つに分ける。

| 画面 | 役割 | 操作 |
|---|---|---|
| スライド | 観客が常に見る主画面 | `outputs/aidea-workshop-20260626.pptx` を開く |
| ターミナル | demo script、curl、test、sensors | フォントは18以上、コマンド履歴を使う |
| VS Code または Cursor | `/private/tmp/project` の中身を短く見せる | `open -a "Visual Studio Code" /private/tmp/project` |
| Codex Desktop | AIへプロンプトを貼る | デモごとに新規スレッド推奨 |

Codex Desktopはデモごとに新規スレッドを使う。前のデモ文脈が残ると、AIが「前の続き」として判断するため。作業ディレクトリは毎回 `/private/tmp/project` にする。

## 便利ツール

### 1. `scripts/run-live-demo.sh`

当日の主役。引数なしでメニューを出す。

```bash
demo
```

選択肢:

```text
1) 01_no_harness
2) 02_characterization
3) 03_architecture_sensor
4) 04_with_full_harness
5) 05_autonomous_loop
6) Restart current /private/tmp/project and verify 7,000-yen shipping
7) Demo complete: stop server and delete /private/tmp/project
q) Quit
```

番号を直接指定してもよい。

```bash
demo 4
demo --restart-check 7000
demo --finish
```

`npm run sensors` の出力は発表用に色付きにしている。greenは緑、redは赤、Warningsは黄、最終サマリは太字で出る。色が出ない場合は、対象プロジェクトの `package.json` の `sensors` が `AIDEA_FORCE_COLOR=1 node scripts/run-sensors.js` になっているか確認する。

### 1.5. Codexループ内sensorの制約

Codex Desktop内で実行する `npm test` / `npm run sensors` は、HTTPサーバのlistenに依存させない。`server.listen()`、`fetch("http://localhost...")`、実ポートへの接続を必要とする確認は、環境制約で `listen EPERM` になることがある。

説明は次で統一する。

- AIループ内: unit / service / controller / in-process API shape / lint / typecheck / policy-boundary / change-package
- ループ外: 実サーバ起動、curl、Integration Test、E2E、CI、本番相当確認

Codexが `listen EPERM` を出した場合は、ポート衝突ではなく「ループ内sensorに実環境依存チェックを混ぜた」問題として扱う。修正方針は、sensorをin-process化し、実サーバcurlは `demo --restart-check 7000` またはCIへ回すこと。

### 2. プロンプト自動コピー

`demo` 実行後、対象demo-unitの `instructor-prompts/run-demo.md` にあるプロンプトが自動でクリップボードへ入る。Codex Desktopではそのまま貼る。
コピーが効かない場合は `/private/tmp/aidea-demo-prompt.txt` を開いて貼る。
貼り直したい場合だけ、次の補助関数を使う。

```bash
copy_prompt demo-units/04_with_full_harness/instructor-prompts/run-demo.md
```

### 3. VS Code または Cursor

プロジェクト説明は全部読まない。以下だけ見せる。

```bash
show_project
show_shipping_refs
```

ファイルを開く場合は、毎回 `/private/tmp/project` を開き直す。

```bash
open -a "Visual Studio Code" /private/tmp/project
```

### 4. ウィンドウ切替ツール

Rectangle、Magnet、Raycastなどで、スライド、ターミナル、Codex Desktop、エディタの位置を固定する。
使い方は単純でよい。

- スライド: 全画面または左半分
- ターミナル: 右上
- Codex Desktop: 右下
- エディタ: 必要な時だけ前面

観客へ見せる画面を探す時間をなくすことが目的。

## 全体台本

### 0. 開始前

ターミナル:

```bash
cd /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626
demo --finish
```

スライド:

```bash
open outputs/aidea-workshop-20260626.pptx
```

言うこと:

> 今日は、AIが間違えるかどうかではなく、AIが直したあとに人間が何を見てリリース判断できるかを見ます。

### 1. Slide 1-13: 問いと考え方

スライドだけで進める。まだCodexやコードは見せない。

言うこと:

> テスト自動化を、テストコードを書く作業だけに限定せず、AIが出した変更を人間が受け入れるための判断材料を集めることとして見ます。

> 既存システムで「送料無料条件を5,000円から7,000円へ変えて」と言われたとき、AIが直したコードを何で確認するのか。ここを今日の問いにします。

Slide 12で言うこと:

> 今日のデモは、足りないものを一段ずつ減らします。L1で機能変更、L2で既存挙動、L3で構造、L4でリリース候補、L5でループ化です。

切替:

> では、まず一番危ない状態から始めます。テストやCRなしで、AIへ1文だけ渡す状態です。

### 2. Demo 1: テストなしで修正を頼む

対象スライド: 14-15

ターミナル:

```bash
demo
# 1 を選ぶ
show_project
show_shipping_refs
```

プロジェクト説明:

> ここでは小さな注文見積もりAPIを使います。今は5,000円以上で送料無料です。ただしテストもCRも判断記録もありません。

Codex Desktop:

- 新規スレッドを開く。
- 作業ディレクトリが `/private/tmp/project` であることを確認する。
- クリップボードのプロンプトを貼る。

貼るプロンプトの意味:

> ここではあえて1文だけです。実際の現場で「とりあえずAIに頼んでみる」とどうなるかを見ます。

Codex実行後に見るもの:

```bash
demo --restart-check 7000
show_shipping_refs
```

必要なら:

```bash
cd /private/tmp/project
node --test 2>/dev/null || true
```

注意して言うこと:

> AIが間違えたら危ない、という話だけではありません。AIが正しく直したように見えても、境界値、レスポンス形式、仕様書との差分を次回も確認できる根拠がありません。

スライドへ戻る:

> Demo 1で分かったのは、機能変更はできたかもしれない、でもリリースOKとは言えない、ということです。

### 3. Demo 2: 既存挙動を固定する

対象スライド: 16-17

ターミナル:

```bash
demo
# 2 を選ぶ
show_project
show_shipping_refs
```

プロジェクト説明:

> 次は、いきなり7,000円へ変えません。まず今のAPIの振る舞いを調べ、どこをテスト化するかをAIに観点表として出させます。

Codex Desktop:

- 新規スレッドを開く。
- `/private/tmp/project` を作業対象にする。
- プロンプトを貼る。

Codexが観点表を出したら、一度止めて説明する。

> ここで大事なのは、いきなりテストを書かせないことです。公開API、境界値、不変条件、エラーケース、docs差分のうち、何をテストにするかを先に説明させています。

Codex実行後に見るもの:

```bash
cd /private/tmp/project
find tests -maxdepth 2 -type f 2>/dev/null || true
node --test
```

詰まった場合:

```bash
less demo-units/02_characterization/instructor-materials/success-log.txt
less demo-units/02_characterization/instructor-materials/test-run-output.txt
```

スライドへ戻る:

> これで既存挙動は壊れたら分かるようになりました。ただし、送料無料判定が複数箇所に散る構造はまだ止められません。

### 4. Demo 3: 責務境界をsensorで止める

対象スライド: 18-19

このデモは、Demo 2で作ったcharacterization testがある状態から始め、Codexにpolicy moduleとsensor一式を生成させる。

ターミナル:

```bash
demo
# 3 を選ぶ
show_project
show_shipping_refs
cd /private/tmp/project
npm test
rg "5000|FREE_SHIPPING|freeShippingPolicy" src docs package.json
```

Codex Desktop:

- 新規スレッドを開く。
- `/private/tmp/project` を作業対象にする。
- Demo 3のプロンプトを貼る。

Codex実行後に見せるファイル:

```bash
cd /private/tmp/project
npm run sensors
sed -n '1,160p' src/services/freeShippingPolicy.js
sed -n '1,180p' docs/architecture/order-estimate-boundaries.md
sed -n '1,220p' scripts/check-policy-boundary.js
```

言うこと:

> Demo 2のテストは外から見える振る舞いを守ります。ただし、送料無料判定が複数のserviceへ分裂していると、次の仕様変更で修正漏れが起きます。ここでは7,000円へ変えず、先に責務を1箇所へ寄せます。

補足:

> ここで作るsensorはCodexが自分で回せる軽量センサーです。実サーバを起動してcurlする確認は、この後の人間の出口確認またはCIへ回します。

悪い差分を見せる:

```bash
cd /private/tmp/project
patch -p0 < /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/demo-units/03_architecture_sensor/instructor-materials/bad-policy-duplication.patch
node --test
npm run sensor:architecture
```

言うこと:

> ここがポイントです。振る舞いテストは緑でも、次の変更を危険にする構造は赤にできます。これがSensorsの役割です。

詰まった場合:

```bash
less /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/demo-units/03_architecture_sensor/instructor-materials/red-output.txt
```

スライドへ戻る:

> ここまでで、既存挙動のテストとpolicy境界センサーが揃いました。次は、AIに最初から読ませるGuidesと、出口で人間が見る記録を足します。

### 5. Demo 4: ハーネスありでリリース候補を作る

対象スライド: 20-24

ターミナル:

```bash
demo
# 4 を選ぶ
show_project
show_shipping_refs
```

先に見せるファイル:

```bash
cd /private/tmp/project
sed -n '1,180p' AGENTS.md
sed -n '1,200p' docs/change-requests/CR-2026-06-26-free-shipping-threshold.md
sed -n '1,160p' docs/specs/order-estimate.md
sed -n '1,160p' docs/decisions/ADR-0001-estimate-api-structure.md
```

言うこと:

> ここからが本編です。CRは人間が用意する変更依頼、AGENTS.mdはCodex向けの作業規約、specは既存仕様、ADRは過去の設計判断です。AIに渡す入口を整えると、AIは何を変え、何を残し、何を記録するかを判断しやすくなります。

Codex Desktop:

- 新規スレッドを開く。
- `/private/tmp/project` を作業対象にする。
- Demo 4のプロンプトを貼る。

Codex実行中に言うこと:

> ここでcharacterization testは全部を永久保存するわけではありません。変えてはいけないレスポンス形式やtotal計算は回帰テストとして残し、4999/5000境界は6999/7000境界の新仕様受け入れテストへ変えます。

補足:

> `npm run sensors` はAIループ内で完結する確認です。実サーバ越しのIntegration確認は、Codex実行後に `demo --restart-check 7000` で人間が見ます。

Codex実行後に見るもの:

```bash
cd /private/tmp/project
npm run sensors
demo --restart-check 7000
show_shipping_refs
sed -n '1,220p' docs/specs/order-estimate.md
sed -n '1,220p' docs/ai/worklog.md
find docs/decisions -maxdepth 1 -type f | sort
```

詰まった場合:

```bash
less /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/demo-units/04_with_full_harness/instructor-materials/red-to-green.txt
less /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/demo-units/04_with_full_harness/instructor-materials/generated-order-estimate.md
less /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/demo-units/04_with_full_harness/instructor-materials/generated-ADR-0002-free-shipping-threshold.md
less /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/demo-units/04_with_full_harness/instructor-materials/generated-worklog-excerpt.md
```

スライドへ戻る:

> Demo 4では、ワークショップ上はリリース候補まで来ました。コード、テスト、センサー、spec、ADR、worklogが揃っています。ただし、現場ではCI、本番相当データ、非機能、デプロイ、監視はまだ別に必要です。

### 6. Demo 5: 自律ループの入口と出口を設計する

対象スライド: 25-27

ターミナル:

```bash
demo
# 5 を選ぶ
show_project
```

先に見せるファイル:

```bash
cd /private/tmp/project
sed -n '1,220p' AGENTS.md
sed -n '1,220p' docs/change-requests/CR-2026-06-26-free-shipping-threshold.md
sed -n '1,180p' docs/ai/loop-state.md
```

言うこと:

> 自律ループは、AIに丸投げすることではありません。CRのfront-matter、完了条件、停止条件、loop-stateの更新ルールを人間が先に置くことで、途中の確認を減らします。

補足:

> Demo 5のループ内sensorは、Codexが実行できるin-process確認に限定します。Integration Testやcurlはcompletion-reportに「CI/人間の出口確認」として残します。

Codex DesktopでLIVE実行する場合:

- 新規スレッドを開く。
- `/private/tmp/project` を作業対象にする。
- Demo 5のプロンプトを貼る。

LIVE実行後に確認する場合:

```bash
cd /private/tmp/project
npm run sensors
demo --restart-check 7000
sed -n '1,220p' docs/ai/completion-report.md
```

時間短縮する場合:

```bash
less /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/demo-units/05_autonomous_loop/instructor-materials/full-session-log.txt
less /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/demo-units/05_autonomous_loop/instructor-materials/loop-state.md
less /Users/hajime/Documents/project/aidea-study/aidea-workshop-20260626/demo-units/05_autonomous_loop/instructor-materials/completion-report.md
```

言うこと:

> 入口と出口に人間の確認を寄せられるのは、Demo 1から4で足場を増やしたからです。最初から自律ループだけを入れても、何を信じて完了とするかが決まりません。

スライドへ戻る:

> ここまでで、足りなかったものが少しずつ埋まりました。最後に、明日からどこに手を付けるかへ戻します。

### 7. Slide 28-32: まとめ

スライドだけで閉じる。

言うこと:

> 今日の話は、AIに任せるか任せないかではありません。AIに任せられる範囲を、人間がGuides、Sensors、Steeringで設計するという話です。

> 明日から最初にやるなら、CRを短く書く、AIに影響範囲とテスト観点を出させる、人間が固定すべき既存挙動を決める。この3つで十分です。

最後の操作:

```bash
demo
# 7 を選ぶ
```

または:

```bash
demo --finish
```

## あたふたしないための運用ルール

- Codex Desktopはデモごとに新規スレッドを使う。
- デモスクリプトを実行したら、まず `/private/tmp/project` のファイルを30秒だけ見せる。
- Codexに貼る前に「このデモで増やすもの」を必ず口で言う。
- Codexが長引いたら、無理に待たず `instructor-materials` のログへ切り替える。
- 同じデモ番号を再実行すると作業結果が消えるので、Codex実行後にサーバ反映とcurl確認をしたい場合は `demo --restart-check 7000` を使う。テストやセンサー確認は `/private/tmp/project` 内の `npm test` や `npm run sensors` を使う。
- ターミナルにエラーが出ても、まず「これはどのSensorが何を止めたのか」を説明する。赤は失敗ではなく判断材料として扱う。

## よくある詰まりと切り替え

| 詰まり | その場の対応 |
|---|---|
| Codexが長く考えている | 「LIVEなのでログに切り替えます」と言って `instructor-materials` を表示する |
| Demo 1でAIが正しく直す | 「正しく直っても証明できない」が結論なので問題ない |
| Demo 2でテスト生成が長い | 観点表だけ説明し、`success-log.txt` と `test-run-output.txt` へ切り替える |
| Demo 3でpatchが当たらない | `red-output.txt` を表示し、test緑/sensor赤の意味を説明する |
| Demo 4でCodexが全部直し切らない | `red-to-green.txt` と生成済みdocsを使い、リリース候補に必要な材料へ話を戻す |
| Demo 5が時間切れ | Codex LIVEを飛ばし、`completion-report.md` と `loop-state.md` だけ見せる |

## 観客へ見せないもの

以下は講師用の補助資料なので、見せる場合は「LIVEが詰まったのでログに切り替えます」と明示する。

- `instructor-notes.md`
- `instructor-materials/session-log.txt`
- `instructor-materials/success-log.txt`
- `instructor-materials/full-session-log.txt`

普段の説明では、プロジェクト内の `src/`、`tests/`、`docs/`、`AGENTS.md`、`CLAUDE.md`、`package.json` を見せる。
