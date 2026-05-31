# Codex権限設定

各デモプロジェクトの `project/.codex/config.toml` には、以下の設定を入れています。

```toml
default_permissions = "project-only"

[permissions.project-only.filesystem]
":minimal" = "read"

[permissions.project-only.filesystem.":workspace_roots"]
"." = "write"

[permissions.project-only.network]
enabled = false
```

## 目的

- プロジェクト外の読み書きを避ける
- デモ中にネットワークアクセスを使わせない
- 悪い例・良い例の比較で、余計な外部情報が混ざる可能性を下げる
- Claude用デモを誤ってCodexで開いた場合も、同じ権限前提にする

## メモリを後で有効化したい場合

各プロジェクトには `.codex/config.enable-memory.example.toml` も置いています。
通常利用に戻す場合の参考として使ってください。
ただし、勉強会デモ中はメモリ無効の `config.toml` を使うことを推奨します。
