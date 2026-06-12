# Demo 5: 自律ループの入口と出口だけを見る

## このデモで証明したいこと

完了条件と停止条件を機械可読にしておくと、人間は途中の作業を全部見るのではなく、入口の依頼と出口のcompletion-reportを確認できる。ただし任せられる範囲はハーネスの整備度で決まる。

## LIVE進行

1. run-demo.mdをAIに渡す。
2. 途中質問せず、completion-reportかescalation-reportまで待つ。
3. 戻ってきたら `docs/ai/loop-state.md` と `docs/ai/completion-report.md` を読む。
4. 最後に `npm run sensors` を実行する。

## 録画・ログ進行

LIVEで時間が読めない場合は、最初からログ進行に切り替える。

```bash
less ../instructor-materials/full-session-log.txt
less ../instructor-materials/completion-report.md
less ../instructor-materials/loop-state.md
```

## 分岐

- max_iterations超過: escalation-reportが出た扱いにし、「止まれるAI」の価値へ切り替える。
- 1反復で終わった: completion-reportの変更ファイル一覧と残リスクを読み、センサー表で確認する。
- change-packageが赤のまま: required_artifacts missing と expected_behaviors mismatch を読み上げ、完了契約が出口を絞ることを説明する。

## フォールバック

`instructor-materials/full-session-log.txt` は初期赤、loop-state、completion-report、全緑sensorsを含む。

## 戻り方

Slide 23へ戻り、Demo1/4/5の人間介入回数比較で締める。
