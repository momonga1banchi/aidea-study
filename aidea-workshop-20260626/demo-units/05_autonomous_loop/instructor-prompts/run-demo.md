# Run Demo Prompt

```
AGENTS.mdに従い、CR-2026-06-26-free-shipping-threshold を処理してください。

進め方:
- CR front-matterの expected_behaviors と required_artifacts を残作業リストとして扱ってください
- 赤になったセンサー、原因、次の方針を docs/ai/loop-state.md に更新してください
- characterization testは、残すもの、書き換えるもの、記録へ移すものに分けて扱ってください
- policy-boundary sensorを壊さない範囲で実装してください
- Codexループ内で実行する test / sensor は `server.listen()` や `fetch("http://localhost...")` に依存させないでください
- API response shapeはin-processで `createApp()`、controller、serviceを呼び出して確認してください
- 実サーバ起動後のcurl、Integration Test、E2Eは人間またはCIの出口確認として `completion-report.md` に残してください
- 人間へ返すのは、completion-report完成時または停止条件該当時のみです
- 途中で質問しないでください

作成または更新する成果物:
- docs/ai/loop-state.md
- docs/ai/completion-report.md
- 停止条件に該当した場合は docs/ai/escalation-report.md
- CRで要求された spec / ADR / worklog / test
- CR status
```
