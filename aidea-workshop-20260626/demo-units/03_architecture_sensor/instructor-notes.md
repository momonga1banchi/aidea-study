# Demo 3: 送料無料policyの責務境界をセンサー化する

## このデモで証明したいこと

Demo 2で外から見える振る舞いは固定できた。しかし、送料無料判定が `orderEstimateService` と `promotionService` に分裂したままだと、次の7,000円変更で修正漏れを生みやすい。Demo 3では、挙動を変えずに `freeShippingPolicy` へ責務を寄せ、その境界をpolicy-boundary sensorで守る。

## 開始前チェック

```bash
cd project
npm test
rg "5000|FREE_SHIPPING|freeShippingPolicy" src docs package.json
```

初期状態ではDemo 2で作ったcharacterization testだけがある。`freeShippingPolicy.js`、`docs/architecture/order-estimate-boundaries.md`、`scripts/run-sensors.js`、各sensor scriptはまだ存在しない。ここでは7,000円への仕様変更はまだしない。

## 進行手順

1. `npm test` で、既存挙動だけは固定できていることを見せる。
2. `rg "5000|FREE_SHIPPING|freeShippingPolicy" src docs package.json` で、送料無料判断がまだ分裂していて、policy moduleやsensorがないことを見せる。
3. Demo 3のプロンプトをCodex Desktopへ貼る。
4. Codexが作成した `src/services/freeShippingPolicy.js` を見せる。
5. `docs/architecture/order-estimate-boundaries.md` を見せ、どの処理をどこへ置くかの前提を確認する。
6. `scripts/check-policy-boundary.js` と `scripts/run-sensors.js` を見せる。
7. `npm run sensors` で全緑を見せる。
8. 悪い例として `bad-policy-duplication.patch` を適用する。

```bash
patch -p0 < ../instructor-materials/bad-policy-duplication.patch
```

9. 先にテストを見せる。既存挙動は変わっていないため緑のままでよい。

```bash
node --test
```

10. 次にpolicy境界センサーを見せる。

```bash
npm run sensor:architecture
```

順番は必ず test緑、policy-boundary赤にする。参加者に「振る舞いが同じでも、次の変更を危険にする構造は止める」と見せるため。

## 達成したこと

- 人間が貼るプロンプトで、policy module、責務境界ドキュメント、policy-boundary sensor、run-sensors登録を作らせた。
- 送料無料判定、閾値取得、残額計算を `freeShippingPolicy.js` に集約できた。
- `promotionService.js` が閾値を直接持つ変更を止められる。
- `orderEstimateService.js` が閾値比較を直接持たない状態を確認できる。
- 振る舞いテストでは守れない責務境界を、policy-boundary sensorで補える。
- 7,000円変更前に、変更すべき場所を狭められた。

## まだ足りないこと

- ここで生成したセンサーは、今回の責務境界を守るためのものに限定される。
- 7,000円へ変えるChange Requestはまだ渡していない。
- 新仕様の受け入れテストへ書き換える作業はまだしていない。
- spec、ADR、worklogを更新するルールはまだ作業入口に組み込んでいない。
- 人間が出口で見るレビュー材料はまだ揃っていない。

## controller直書きとの違い

controllerに金額ロジックを書く悪例は分かりやすいが、今回の本筋から外れる。ここでは、実際にこのコードが抱えていた「送料無料閾値の重複」を扱う。同じお題のまま、次の仕様変更で困る構造を先に潰す。

## フォールバック

`instructor-materials/red-output.txt` と `success-log.txt` を表示する。patchコマンド、node --test、npm run sensorsの生出力相当が入っている。

## 戻り方

Slide 19へ戻る。言うことは「後から検出するSensorsは増えました。次は、AIに最初から守ってほしい前提と、7,000円へのChange Requestを渡します」。ここでAGENTS.mdとCRへ接続する。
