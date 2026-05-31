# AIコーディング勉強会デモ用API

## このプロジェクトについて

これは、社内AI勉強会で使う小さなExpress + Jestプロジェクトです。

最初からあるAPIは以下です。

```text
GET /health
GET /tax?price=1000
```

## 起動と確認

```bash
npm install
npm test
npm run lint
npm start
```

サーバー起動後の確認例：

```bash
curl http://localhost:3000/health
curl 'http://localhost:3000/tax?price=1000'
```

## 最初からある機能

### GET /health

サービスが動いていることを確認するAPIです。

### GET /tax?price=1000

価格から消費税額と税込金額を返します。

レスポンス例：

```json
{
  "ok": true,
  "data": {
    "price": 1000,
    "taxRate": 0.1,
    "tax": 100,
    "total": 1100
  }
}
```

## 勉強会で追加する改修

会員ランク割引APIを追加します。

```text
GET /discount?amount=50000
```

このプロジェクトが「悪い例」用か「良い例」用かは、親ディレクトリ名で判断してください。

- `no-harness`: AGENTS.md / CLAUDE.md や仕様書を置かない悪い例用
- `with-harness`: AGENTS.md / CLAUDE.md、仕様書、タスクファイルを置いた良い例用
