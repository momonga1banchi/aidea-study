# Claude Desktop / Claude Code 用の権限・サンドボックス設定

このキットでは、各デモプロジェクトの `project/.claude/settings.json` に、Claude用の安全寄り設定を入れています。

Codex側の `.codex/config.toml` に入れている以下の思想に近づけるためです。

```toml
default_permissions = "project-only"

[permissions.project-only.filesystem]
":minimal" = "read"

[permissions.project-only.filesystem.":workspace_roots"]
"." = "write"

[permissions.project-only.network]
enabled = false
```

## Claude側での設定方針

Claude Codeには、Codexの `default_permissions = "project-only"` と完全に同じ1行設定はありません。

そのため、以下の組み合わせで近い状態を作っています。

- `.claude/settings.json` を各 `project/` に置く
- `autoMemoryEnabled: false` で自動メモリを無効化する
- `permissions.defaultMode: "acceptEdits"` でプロジェクト内編集を進めやすくする
- `permissions.deny` で `.env`、`secrets/`、`.claude/`、`.codex/`、危険なBash、WebFetch/WebSearchを拒否する
- `sandbox.enabled: true` でBashサンドボックスを有効にする
- `sandbox.filesystem.allowRead: ["."]` と `allowWrite: ["."]` で、サンドボックス化されたBashの読み書きをプロジェクト中心にする
- `sandbox.network.allowedDomains: []` と `deniedDomains: ["*"]` でネットワーク利用を避ける
- `sandbox.allowUnsandboxedCommands: false` で、サンドボックス外への再試行を抑止する

## 注意点

Claudeのプロジェクト設定は、管理設定ではありません。

そのため、ユーザー側のグローバル設定、アプリ側の承認、OS、Claude Codeのバージョンによって挙動が変わる可能性があります。

特に、ネットワークを完全に組織レベルで禁止したい場合は、プロジェクト設定だけではなく、Managed設定やネットワークレベルの制御も検討してください。

勉強会では、以下を必ず実施してください。

```text
1. 各デモでは新しい project/ を開く
2. Claudeでは新しいセッションを使う
3. /status で設定ソースを確認する
4. /permissions で権限ルールを確認する
5. /sandbox でサンドボックス状態を確認する
6. 不要な既存会話・既存プロジェクトを使い回さない
```

## メモリを後で有効にしたい場合

各プロジェクトには、以下の例ファイルも置いています。

```text
.claude/settings.enable-memory.example.json
```

勉強会後にメモリありの挙動を試したい場合は、内容を確認したうえで `settings.json` に置き換えてください。

ただし、比較デモ中はメモリOFFのままにしてください。
