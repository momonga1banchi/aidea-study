# 注文見積もりAPIの責務境界

## 目的

送料無料条件の変更時に、同じ業務判断が複数のserviceへ分裂しないようにする。

## 責務

| 領域 | 責務 |
|---|---|
| `src/config/pricing.js` | 金額設定値を定義する |
| `src/services/freeShippingPolicy.js` | 送料無料判定、閾値取得、残額計算を一箇所で扱う |
| `src/services/orderEstimateService.js` | 見積もり結果を組み立てる。送料無料の判断はpolicyへ委譲する |
| `src/services/promotionService.js` | 表示や販促に近い処理を扱う。閾値そのものは持たない |
| `src/controllers/*Controller.js` | HTTP入出力の変換だけを扱う |

## センサーで守ること

- `promotionService.js` は `5000` や `7000` のような送料無料閾値を直接持たない。
- `orderEstimateService.js` は `FREE_SHIPPING_THRESHOLD` を直接参照しない。
- 送料無料判定は `freeShippingPolicy.js` 経由にする。
- controllerからrepositoryやconfigへ直接依存しない。
