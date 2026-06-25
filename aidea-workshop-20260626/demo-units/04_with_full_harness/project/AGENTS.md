# AGENTS.md

このリポジトリでAIエージェントが作業するときの規約。

## 調査の原則

- docs/specs は古い可能性がある。現状の仕様はコードとテストから確認し、乖離を見つけたら docs/ai/worklog.md に記録する。
- 変更前に、変更対象の値・ロジックが複数箇所に存在しないか全文検索する。

## 守ること

- 変更対象は依頼(docs/change-requests/)に書かれた範囲に限定する。
- 既存のAPIレスポンス形式は変えない。
- コントローラーに金額計算・閾値判定を書かない。計算ロジックはservices/に置く。
- 業務上の設定値(閾値・送料)は src/config/pricing.js に置く。
- 送料無料判定、閾値取得、残額計算は src/services/freeShippingPolicy.js に集約する。
- orderEstimateService と promotionService が別々に送料無料閾値を持ってはいけない。
- 作業の各段階で npm run sensors を実行し、全センサー緑を確認してから次へ進む。
- Codexループ内で実行する test / sensor は、HTTPサーバのlistenに依存させない。`server.listen()`、`fetch("http://localhost...")`、実ポートへの接続を必要とする確認は、CIまたは人間の出口確認へ回す。
- API response shapeは、`createApp()`、controller、serviceをプロセス内で呼び出すin-process checkで確認する。
- `src/server.js` の実サーバ起動処理は残す。実サーバ起動後のcurl、Integration Test、E2Eは `npm run sensors` とは分ける。
- scripts/run-sensors.js の出力は発表・レビューで見やすく保つ。greenはANSI緑、redはANSI赤、WarningsはANSI黄、最終成功/失敗サマリは太字で表示する。AIDEA_FORCE_COLOR=1 / FORCE_COLOR=1 では色付き表示を強制し、NO_COLOR=1 または TERM=dumb では色なしにする。ただし強制指定がある場合は強制指定を優先する。npm run sensors だけで発表用の色付き出力になるよう、package.jsonのsensors scriptは AIDEA_FORCE_COLOR=1 を付けて実行する。
- characterization testは、残すもの、書き換えるもの、記録へ移すものに分ける。仕様変更対象の境界値テストは新仕様の受け入れテストへ更新してよい。
- 既存テストを削除して逃げない。変更理由をworklogへ残す。
- 判断に迷う場合は勝手に決めず確認する。

## 記録すること

- 仕様変更を実装したら docs/specs/ を現実に合わせて更新する。
- 設計判断をしたら docs/decisions/ にADRを追加する(テンプレートはADR-0001参照)。
- 作業の要約・発見した問題・残リスクを docs/ai/worklog.md に追記する。Integration Testやcurlなど、CI/人間の出口確認に回した項目も残す。
