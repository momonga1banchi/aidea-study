# 注文金額計算API

小さな既存システムを想定したNode製APIです。

## 起動

```bash
npm start
```

## API

```bash
curl -sS -X POST http://127.0.0.1:3000/orders/estimate \
  -H 'content-type: application/json' \
  -d '{"items":[{"sku":"UNIT-001","quantity":5000}]}'
```
