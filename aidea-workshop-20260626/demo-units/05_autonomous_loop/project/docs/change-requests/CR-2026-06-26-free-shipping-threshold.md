---
id: CR-2026-06-26-free-shipping-threshold
status: in_progress
acceptance: [test, lint, typecheck, architecture, schema, change-package]
expected_behaviors:
  - { module: "src/services/orderEstimateService.js", call: "estimateOrderBySubtotal", input: 6999, expect: { shippingFee: 500 } }
  - { module: "src/services/orderEstimateService.js", call: "estimateOrderBySubtotal", input: 7000, expect: { shippingFee: 0 } }
required_artifacts:
  - { kind: spec,    path: "docs/specs/order-estimate.md", must_include: ["7,000"] }
  - { kind: adr,     path_glob: "docs/decisions/ADR-*-free-shipping-threshold.md", must_include: ["CR-2026-06-26"] }
  - { kind: worklog, path: "docs/ai/worklog.md", must_include: ["CR-2026-06-26", "残リスク"] }
  - { kind: test,    path_glob: "tests/**/*threshold*.test.js" }
out_of_scope: ["UI変更", "DBスキーマ変更", "税計算"]
max_iterations: 5
---

# 送料無料閾値を7,000円以上へ変更する

- 依頼日: 2026-06-26 / 依頼者: 事業部
- 背景: 配送コスト上昇のため、送料無料ラインを5,000円から7,000円へ引き上げる。
- 受け入れ条件(人間が読む形):
  - 小計6,999円 → 送料500円
  - 小計7,000円 → 送料0円
  - APIレスポンスの形式は変えない
  - 「あと◯円で送料無料」の表示金額も新閾値に追随する
- 対象外: UI変更、税計算、DBスキーマ
- 完了の定義: 全テスト・全センサー緑 + 仕様書とADRの更新 + worklog記録

