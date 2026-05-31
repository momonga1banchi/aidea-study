# 会員ランク割引API 仕様書

## 目的

月間購入金額から、会員ランクと割引率を返すAPIを追加する。

## 追加するエンドポイント

```text
GET /discount?amount=50000
```

## 正常系レスポンス例

```json
{
  "ok": true,
  "data": {
    "amount": 50000,
    "rank": "gold",
    "discountRate": 0.05
  }
}
```

## ランク判定ルール

| amount | rank | discountRate |
|---:|---|---:|
| 0〜9999 | bronze | 0 |
| 10000〜49999 | silver | 0.03 |
| 50000〜99999 | gold | 0.05 |
| 100000以上 | platinum | 0.1 |

## 異常系

以下の場合はHTTP 400を返す。

- `amount` が未指定
- `amount` が数値ではない
- `amount` が負数
- `amount` が小数

## 異常系レスポンス形式

既存の `/tax` API と同じ形式にする。

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "amountは0以上の整数で指定してください"
  }
}
```

## 実装方針

- ルーティングは `src/routes/` に置く。
- HTTP request / response処理は `src/controllers/` に置く。
- 会員ランク判定ロジックは `src/services/` に置く。
- controllerにランク判定ロジックを直接書かない。
- 新しい依存packageは追加しない。
