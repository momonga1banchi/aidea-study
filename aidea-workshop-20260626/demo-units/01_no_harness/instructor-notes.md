# Demo 1: ハーネスなしでAIに依頼する

## このデモで証明したいこと

AIが「変更できた」と返しても、確認する足場がなければ受け入れ根拠にならないことを見せる。題材は送料無料閾値の変更で、pricing.jsだけを直すと、送料計算と表示メッセージが矛盾する。

## 開始前チェック

```bash
cd project
node src/server.js
```

別ターミナルで以下を実行できる状態にしておく。

```bash
curl -sS -X POST http://127.0.0.1:3000/orders/estimate \
  -H 'content-type: application/json' \
  -d '{"items":[{"sku":"UNIT-001","quantity":6000}]}'
```

## 実演手順

1. `instructor-prompts/run-demo.md` の1文だけをAIに渡す。
2. AIが `src/config/pricing.js` だけを直した場合、すぐにcurlを実行する。
3. レスポンスの `shippingFee: 500` と `message: "送料無料"` を横に並べて読む。
4. `rg "5000|FREE_SHIPPING|threshold" src docs` を実行し、promotionService.jsと古い仕様書を見せる。

## AIが重複まで直してしまった場合

その場合は成功扱いにしない。次の切り返しを使う。

```bash
rg "3,000|5000|7000" docs src
```

仕様書が3,000円のまま残っていることを見せ、「実装が偶然良くても、受け入れ根拠はまだ弱い」と説明する。

## フォールバック

`instructor-materials/contradiction-curl.txt` を表示する。そこには実際のcurlコマンドと矛盾レスポンスが入っている。

## 戻り方

矛盾レスポンスを見せたらSlide 13へ戻り、「できました、をどう信用するか」に接続する。
