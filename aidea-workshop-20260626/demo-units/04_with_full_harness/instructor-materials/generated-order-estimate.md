# 注文見積りAPI仕様 更新後抜粋

last-updated: 2026-06-26

POST /orders/estimate は商品SKUと数量から小計、送料、合計、送料無料までの残額、表示メッセージを返す。

- 送料無料閾値: 7,000円
- 通常送料: 500円
- 成功レスポンスには subtotal / shippingFee / total / freeShippingThreshold / freeShippingRemaining / message / appliedRules を含める。
- 小計6,999円では送料500円、小計7,000円では送料0円。

更新理由: CR-2026-06-26-free-shipping-threshold により、配送コスト上昇へ対応するため送料無料ラインを変更した。
