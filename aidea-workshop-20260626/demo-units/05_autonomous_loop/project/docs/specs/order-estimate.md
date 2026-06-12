# 注文見積りAPI仕様

last-updated: 2024-11

POST /orders/estimate は商品SKUと数量から小計、送料、合計、送料無料までの残額、表示メッセージを返す。

- 送料無料閾値: 3,000円
- 通常送料: 500円
- 成功レスポンスには subtotal / shippingFee / total / freeShippingThreshold / freeShippingRemaining / message / appliedRules を含める。

注意: この仕様書は現実と異なる可能性がある。変更前にはコードと実レスポンスを確認する。
