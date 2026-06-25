# Run Demo Prompt

```
AGENTS.mdを読んだ上で、docs/change-requests/CR-2026-06-26-free-shipping-threshold.md の変更を実装してください。

進め方:
- 既存のcharacterization testを、残すもの、書き換えるもの、記録へ移すものに分けてください
- 4999/5000境界の期待値は、6999/7000境界の新仕様受け入れテストへ書き換えてください
- response形式、不正入力、total計算など、変えてはいけない挙動は回帰テストとして残してください
- 送料無料判定の責務境界は freeShippingPolicy と policy-boundary sensor に従ってください
- Codex実行環境ではHTTPサーバのlistenが制限される場合があるため、test / sensor は `server.listen()` や `fetch("http://localhost...")` に依存させず、API response shapeはin-processで確認してください
- 実サーバ起動後のcurlやIntegration Testは、AIループ内ではなく人間またはCIの出口確認として扱ってください
- 各段階でセンサーを実行し、全部緑になったら仕様書・ADR・worklogを更新して完了報告してください

作成または更新する成果物:
- src/config/pricing.js
- tests/ 配下の境界値テスト
- docs/specs/order-estimate.md
- docs/decisions/ADR-*-free-shipping-threshold.md
- docs/ai/worklog.md
```
