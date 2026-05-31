# クイックデモチェックリスト

## 開始前

- [ ] ZIPを展開した
- [ ] `scripts/setup-demo-projects.sh` または PowerShell版を実行した
- [ ] 各 `project/` で `npm test` が通る
- [ ] 各 `project/` で `npm run lint` が通る
- [ ] Codex / Claude に開かせるのは `project/` のみだと確認した
- [ ] `instructor-prompts/` をAIに見せない運用を確認した

## 悪い例

- [ ] no-harness の `project/` を開いた
- [ ] 講師用プロンプトを人間が読んだ
- [ ] AIには曖昧な依頼だけを入力した
- [ ] 差分を参加者と確認した
- [ ] テスト不足・仕様推測・設計ズレを確認した
- [ ] デモ後に差分を戻した

## 良い例

- [ ] with-harness の `project/` を開いた
- [ ] AGENTS.md / CLAUDE.md があることを確認した
- [ ] 仕様書があることを確認した
- [ ] タスクファイルを1つずつ読ませた
- [ ] 調査と計画で一度止めた
- [ ] テストだけ追加させた
- [ ] 最小実装させた
- [ ] npm test / npm run lint を実行させた
- [ ] 差分レビューさせた

## 最後に確認すること

- [ ] 悪い例と良い例の差を参加者に説明した
- [ ] AIに見える情報を分ける重要性を説明した
- [ ] メモリ・セッション分離の注意点を説明した
- [ ] AI生成コードは人間レビューが必須だと説明した

## Codex権限設定の確認

- 各 `project/.codex/config.toml` に `default_permissions = "project-only"` が入っていることを確認する。


## Claudeデモ前チェック

Claude Desktop / Claude Codeで各 `project/` を開いたら、以下を確認します。

```text
/status
/permissions
/sandbox
```

確認ポイント：

- Project settings として `.claude/settings.json` が読まれている
- Auto memory が無効になっている
- Sandbox が有効になっている
- WebFetch / WebSearch / curl / wget などがdenyされている
- 作業対象がそのデモ単位の `project/` だけになっている
```
