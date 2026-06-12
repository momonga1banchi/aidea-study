# 02. デモ対象コードベース完全仕様

全demo-unitのprojectは、ここで定義する「注文金額計算API」の同一コードベースを基礎とする(デモごとの差分は04で規定)。
**このツリーを縮小・統合してはいけない。** 1ファイルの玩具コードでは「既存プロジェクトにAIを入れる」という訴求も、調査フェーズも、デモの罠も成立しない。

## 技術前提

- Node 20以上、外部依存ゼロ(`node:http`、`node --test`)。`"type": "commonjs"`。
- `package-lock.json`(空でも生成)と `.node-version`(20)を同梱。
- ESLint等は使わず、`scripts/lint.js`(自前の軽量チェック)とJSDoc + `tsc --noEmit`(typecheck)で代替。typecheckスクリプトは `npx --yes typescript@5 tsc --noEmit` をフォールバック付きで呼ぶ。
- 全テスト・全センサーは外部ネットワーク不要で5秒以内に完走すること(LIVE実演の生命線)。

## ファイルツリー(完成形=demo 04のproject/ 直下)

デモごとの「存在する/しない」は04の状態マトリクスで規定。ここは全部入りの完成形。

```
project/
├── README.md
├── AGENTS.md                        # 正文は03で規定
├── CLAUDE.md                        # 「@AGENTS.md」+Claude向け補足のみ
├── package.json
├── package-lock.json
├── .node-version                    # 20
├── src/
│   ├── server.js                    # http.createServer起動のみ
│   ├── app.js                       # メソッド+パスのルーティング、JSONボディパース、エラー→500
│   ├── controllers/
│   │   ├── healthController.js      # GET /health → { status: "ok" }
│   │   └── orderController.js       # POST /orders/estimate
│   ├── services/
│   │   ├── orderEstimateService.js
│   │   └── promotionService.js      # ★罠: 閾値5000をハードコード
│   ├── repositories/
│   │   └── productRepository.js     # インメモリ商品マスタ(5商品以上、単価1円のUNIT-001を含む)
│   └── config/
│       └── pricing.js               # FREE_SHIPPING_THRESHOLD=5000, SHIPPING_FEE=500
├── scripts/
│   ├── sensor-utils.js
│   ├── lint.js
│   ├── typecheck.js
│   ├── check-architecture.js        # 仕様は03 ★このワークショップの目玉センサー
│   ├── architecture-allowlist.json  # 既知の負債リスト(仕様は03)
│   ├── check-schema.js              # 仕様は03
│   ├── check-change-package.js      # 仕様は03(demo 05のみ使用)
│   └── run-sensors.js               # 全センサー実行、表形式出力
├── tests/
│   ├── testHelper.js                # サーバ起動/停止、fetchヘルパ、itemsForSubtotal
│   ├── health.test.js
│   ├── orderEstimateService.test.js # unit
│   ├── promotionService.test.js     # unit
│   ├── orderEstimate.api.test.js    # integration(HTTP経由) ★不変条件テスト含む
│   └── snapshots/api-schema.json
└── docs/
    ├── specs/order-estimate.md      # ★意図的に古い(閾値3,000円と記載)
    ├── decisions/ADR-0001-estimate-api-structure.md
    ├── change-requests/             # デモごとに04で規定
    └── ai/
        ├── worklog.md               # 空テンプレート
        └── code-review.md           # 自己レビューチェックリスト
```

## 主要コードの規定

### src/config/pricing.js

```js
// @ts-check
/** 送料無料となる小計の下限(円) */
const FREE_SHIPPING_THRESHOLD = 5000;
/** 通常送料(円) */
const SHIPPING_FEE = 500;
module.exports = { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE };
```

### src/services/promotionService.js — 教材の核となる罠

```js
// @ts-check
/**
 * 送料無料まであといくらかを返す。0なら送料無料圏内。
 * NOTE: 2024年のキャンペーン実装時に追加。閾値が config/pricing.js と重複している。
 * TODO: pricing.js へ寄せる (PROMO-412)
 * @param {number} subtotal
 * @returns {number}
 */
function freeShippingRemaining(subtotal) {
  const threshold = 5000; // ★意図的なハードコード重複
  return Math.max(0, threshold - subtotal);
}
module.exports = { freeShippingRemaining };
```

**この重複は制作時に「親切に」直さないこと。** デモの仕掛けとして3通りに機能する:

1. **Demo 1(ハーネスなし)**: AIに「閾値を7,000円に変更して」と頼むと、AIがpricing.jsだけを直す可能性が高い。テストがないので誰も気づかず、`subtotal=6000` のとき送料500円なのにmessageは「送料無料」という矛盾レスポンスが生まれる。発表者がcurlで見せる。
2. **Demo 2(テスト化)**: 不変条件テスト(下記)がこの矛盾の検出器として作られる。
3. **Demo 4/5(ハーネスあり)**: 同じ変更依頼で不変条件テストが赤になり、AIが全文検索で重複を発見して直す。「センサーがAIの間違いを捕まえ、AI自身が修復する」見せ場になる。

### src/services/orderEstimateService.js

- `estimateOrder(items)`: items=[{sku, quantity}]。productRepositoryで単価解決→subtotal算出。不正sku/quantityはTypeError。
- 戻り値: `{ subtotal, shippingFee, total, freeShippingThreshold, freeShippingRemaining, appliedRules }`
- shippingFeeは `subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE`(pricing.jsを参照)。
- freeShippingRemainingは promotionService を呼ぶ。
- appliedRules: `"free-shipping"` または `"standard-shipping"` を含む配列。
- `estimateOrderBySubtotal(subtotal)`(items経由と同一ロジックを通す小計直指定版)を**必ず**エクスポートする(全デモ共通。demo 05のchange-package sensorがbefore状態でもこれを呼んで期待値不一致を赤として出せるようにするため)。

### src/controllers/orderController.js

- POST /orders/estimate、ボディ `{ items: [{sku, quantity}] }`。
- 200: serviceの戻り値 + `message`(remaining>0なら `あと${remaining}円で送料無料`、0なら `送料無料`)。
- 400: バリデーションエラー `{ error: string }`。
- **コントローラー内に金額計算・閾値判定・数値リテラルを置かない**(architecture sensorの検査対象。03参照)。

### tests/orderEstimate.api.test.js に必ず含める不変条件テスト

```js
test('invariant: shippingFee === 0 ⟺ freeShippingRemaining === 0', async () => {
  for (const subtotal of [0, 4999, 5000, 6999, 7000, 12000]) {
    const res = await postEstimate(itemsForSubtotal(subtotal));
    if (res.shippingFee === 0) assert.equal(res.freeShippingRemaining, 0);
    else assert.ok(res.freeShippingRemaining > 0);
  }
});
```

`itemsForSubtotal` はtestHelperに実装(単価1円の商品 `UNIT-001` を quantity=subtotal で注文する)。
このテストは閾値の値に依存しない書き方なので、変更前後どちらでも有効。**片側だけ閾値を変更した瞬間に赤になる検出器**として機能する。

### docs/specs/order-estimate.md(意図的なドキュメント乖離)

仕様書には「送料無料閾値: 3,000円」と**現実(5,000円)と違う値**を記載し、末尾に `last-updated: 2024-11` を入れる。
狙い: Demo 2でAIが「docsではなくコードと実際の挙動から現状を復元する」調査をする様子、またはworklogに乖離を記録する様子を見せる。「仕様がドキュメント・Slack・記憶に分散していて古い」というSES現場あるあるの再現。発表者ガイドでこの仕掛けに必ず言及すること(04参照)。

### tests/snapshots/api-schema.json

POST /orders/estimate 成功レスポンスのキー集合と型:
`{subtotal:number, shippingFee:number, total:number, freeShippingThreshold:number, freeShippingRemaining:number, message:string, appliedRules:string[]}`。

## 規模の下限(検収対象)

- src配下: 8ファイル以上、合計250行以上。
- tests配下(存在するデモにおいて): テストファイル4本以上、test()合計20件以上。
- README.md: プロジェクトの起動方法・APIの叩き方(curl例)を含む。聴衆が「自分の現場の小さい既存サービス」と思える程度の現実感を持たせる。
