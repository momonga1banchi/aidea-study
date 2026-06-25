# Run Demo Prompt

```
現在の注文見積もりAPIの挙動を調査し、既存挙動を固定するcharacterization testを作成してください。

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

テスト作成時の制約:
- Codex実行環境ではHTTPサーバのlistenが制限される場合があるため、`npm test` で実行するテストは `server.listen()` や `fetch("http://localhost...")` に依存させないでください。
- API境界のテストは、`createApp()`、controller、serviceをプロセス内で呼び出すin-process testとして作成してください。
- 実サーバ起動後のcurl確認は、テスト内ではなく人間またはCIの出口確認として扱ってください。

観点ごとに、テスト化する/しない、理由、確認方法を表にしてください。
その後、採用した観点だけをテストにしてください。
```
