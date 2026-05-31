# 社内AI勉強会ハンズオンキット v4 日本語版

## このZIPの目的

このキットは、Codex Desktop / Claude Desktop を使った社内AI勉強会用のハンズオン素材です。

前版からの主な変更点は以下です。

- 参加者・講師・AI向けの文章を基本的に日本語化
- 悪い例と良い例を、デモ単位ごとに完全に別プロジェクトとして分離
- Codex / Claude に開かせるディレクトリを `project/` に限定
- 講師用プロンプトは `instructor-prompts/` に分離し、AIに見えない前提で運用
- Codex / Claude のセッション記憶・自動メモリを使わない前提の設定ファイルを配置
- 各 `project/` に `.codex/config.toml` を配置し、Codexの作業権限をプロジェクト内の読み書きに限定し、ネットワークアクセスを無効化

## 重要な運用ルール

Codex Desktop / Claude Desktop で開くのは、必ず各デモ単位の `project/` ディレクトリだけにしてください。

たとえば Codex の悪い例では、以下だけをプロジェクトとして開きます。

```text
demo-units/01-codex-no-harness/project
```

親ディレクトリの `demo-units/01-codex-no-harness/` を開くと、講師用プロンプトの `instructor-prompts/` が見えてしまいます。  
それではAIが「カンニング」できてしまうため、デモの意味が薄れます。


## Codex権限設定

各デモ単位の `project/` には、以下のCodex設定を入れています。

```toml
default_permissions = "project-only"

[permissions.project-only.filesystem]
":minimal" = "read"

[permissions.project-only.filesystem.":workspace_roots"]
"." = "write"

[permissions.project-only.network]
enabled = false
```

この設定により、デモ中はプロジェクト内での読み書きを基本とし、ネットワークアクセスを使わない前提にしています。
Claude用デモプロジェクトにも `.codex/config.toml` を入れているため、誤ってCodexで開いた場合も同じ権限前提になります。

## デモ単位

```text
demo-units/
  01-codex-no-harness/
    project/              # Codexで開く。悪い例。仕様・AGENTSなし
    instructor-prompts/   # 講師だけが見る

  02-codex-with-harness/
    project/              # Codexで開く。良い例。AGENTS/spec/tasksあり
    instructor-prompts/   # 講師だけが見る

  03-claude-no-harness/
    project/              # Claude Desktop Codeで開く。悪い例。仕様・CLAUDEなし
    instructor-prompts/   # 講師だけが見る

  04-claude-with-harness/
    project/              # Claude Desktop Codeで開く。良い例。CLAUDE/spec/tasksあり
    instructor-prompts/   # 講師だけが見る
```

## 最初からあるAPI

各 `project/` には、最初から以下のAPIがあります。

```text
GET /health
GET /tax?price=1000
```

`/tax` は、価格から消費税額と税込金額を返す小さなAPIです。  
このAPIを見せることで、既存プロジェクトの構成を説明しやすくしています。

## 追加する改修

デモで追加する改修は、以下の会員ランク割引APIです。

```text
GET /discount?amount=50000
```

期待レスポンス例：

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

## まず実行すること

ZIPを展開したら、以下を実行してください。

```bash
cd ai-coding-workshop-kit-v3-jp
bash scripts/setup-demo-projects.sh
```

Windows PowerShellの場合：

```powershell
cd ai-coding-workshop-kit-v3-jp
.\scripts\setup-demo-projects.ps1
```

このセットアップでは、各 `project/` ごとに `npm install` と `git init` を行います。

## デモ後に初期状態へ戻す

```bash
bash scripts/reset-demo-projects.sh
```

Windows PowerShellの場合：

```powershell
.\scripts\reset-demo-projects.ps1
```

## 基本的なデモの流れ

1. 悪い例プロジェクトを開く
2. 講師が `instructor-prompts/` のプロンプトを見ながら、AIに雑な指示を出す
3. AIの出力・差分・テスト不足を参加者と確認する
4. 良い例プロジェクトを開く
5. AGENTS.md / CLAUDE.md、仕様書、タスクファイルに沿って進める
6. テスト・lint・差分レビューまで含めて比較する

## 勉強会で伝えたいこと

AIにコードを書かせること自体は難しくありません。  
難しいのは、AIが出したコードを、既存設計に合い、テスト可能で、レビュー可能な状態にすることです。

このキットでは、次の違いを体感してもらいます。

- ハーネスなし：AIが仕様を推測し、実装の品質がブレやすい
- ハーネスあり：仕様・制約・テスト・完了条件に沿って、検証可能な実装になりやすい


## Claude用の権限・サンドボックス設定

v5では、Codex用の `.codex/config.toml` に加えて、全デモプロジェクトの `project/.claude/settings.json` にも安全寄り設定を追加しています。

主な内容は以下です。

- 自動メモリOFF
- プロジェクト内編集を前提にした `acceptEdits`
- `.env` / `secrets/` / `.claude/` / `.codex/` の読み書き制限
- `curl` / `wget` / `npx` / `sudo` / `git push` / `rm -rf` などの禁止
- WebFetch / WebSearch の禁止
- BashサンドボックスON
- サンドボックス化されたBashの読み書きをプロジェクト中心に制限
- ネットワーク利用を避ける設定

詳細は以下を参照してください。

```text
docs/workshop/claude-permissions.md
```
