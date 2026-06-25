# Run Demo Prompt

```
送料無料判定の責務を整理してください。

現在のprojectには、policy module、docs/architecture、scripts/配下のsensorはまだありません。
必要なpolicy module、責務境界ドキュメント、sensor scripts、package.json scriptsはこの依頼の中で作成してください。

条件:
- 外部APIの挙動は変えない
- 既存のcharacterization testは全て通す。まず npm test で現在地を確認する
- Codexループ内で実行する test / sensor は `server.listen()` や `fetch("http://localhost...")` に依存させない。API response shape checkはin-processで `createApp()`、controller、serviceを呼び出して確認する
- 実サーバ起動後のcurl確認は、sensor内ではなく人間またはCIの出口確認として扱う
- 送料無料条件の判定、閾値取得、残額計算は1つのpolicy moduleに集約する
- orderEstimateServiceとpromotionServiceが別々に閾値判断を持たないようにする
- どの処理をどこに置くかを docs/architecture/order-estimate-boundaries.md に記録する
- policy境界を検出するsensorを作成し、npm run sensors に登録する
- review用の基本sensorとして lint、typecheck、API response shape check も作成し、npm run sensors に含める
- API response shape checkは、既存APIのresponse key/typeをスナップショット化し、形式が変わったら赤にする
- scripts/run-sensors.js は発表で見せやすい出力にする
  - statusのgreenはANSI緑、redはANSI赤で表示する
  - WarningsはANSI黄で表示する
  - 最後に成功時は "All sensors are green." を太字の緑、失敗時は "Sensor run failed: N red sensor(s)." を太字の赤で表示する
  - AIDEA_FORCE_COLOR=1 または FORCE_COLOR=1 の場合は色付き表示を強制する
  - NO_COLOR=1 または TERM=dumb の場合は色なしで表示する。ただし AIDEA_FORCE_COLOR=1 / FORCE_COLOR=1 がある場合はそちらを優先する
  - npm run sensors だけで発表用の色付き出力になるよう、package.jsonのsensors scriptは AIDEA_FORCE_COLOR=1 を付けて実行する
  - 追加npm packageには依存しない
- 完了後に npm run sensors を実行する

作成または更新する成果物:
- src/services/freeShippingPolicy.js
- src/services/orderEstimateService.js
- src/services/promotionService.js
- docs/architecture/order-estimate-boundaries.md
- tests/snapshots/api-schema.json
- scripts/sensor-utils.js
- scripts/lint.js
- scripts/typecheck.js
- scripts/check-api-response.js
- scripts/check-schema.js
- scripts/check-architecture.js
- scripts/check-policy-boundary.js
- scripts/run-sensors.js
- package.json の test / lint / typecheck / sensor:architecture / sensor:api-response / sensor:schema / sensors scripts

これは7,000円への仕様変更ではなく、その前に修正漏れを減らすための準備リファクタです。
```
