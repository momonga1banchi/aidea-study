# タスク03：最小実装

## 読むファイル

- `AGENTS.md` または `CLAUDE.md`
- `docs/specs/member-discount.md`

## タスク

失敗しているテストを通すための最小限の本番コードを実装する。

## 制約

- 既存の route / controller / service 構成に合わせる。
- business logic は `services/` に置く。
- controllerにはHTTP request / response処理だけを書く。
- 依存packageを追加しない。
- 既存のpublic API response formatを勝手に変えない。
- 無関係なファイルを変更しない。

## 作業後

1. `npm test` を実行する。
2. `npm run lint` を実行する。
3. 失敗があれば原因を説明して修正する。
4. 差分を日本語で要約する。
5. 残リスクと追加確認すべき点を列挙する。
