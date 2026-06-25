# Demo 5: 完了条件と停止条件で途中介入を減らす

## このデモで証明したいこと

Demo 4では、人間が途中の赤や修正方針を見ながら進めた。Demo 5では、CRを機械可読にし、完了条件と停止条件を渡すことで、人間の介入点を入口と出口へ寄せられることを見せる。

## 開始前チェック

```bash
cd project
npm run sensors
```

開始時点では `change-package` だけが赤になる。これは失敗ではなく、CRに対してまだ必要成果物と期待挙動が満たされていないことを示す残作業リストである。

## LIVE進行

1. `run-demo.md` をAIに渡す。
2. AIはCR front-matterの `expected_behaviors` と `required_artifacts` を残作業リストとして読む。
3. 途中質問せず、completion-reportかescalation-reportまで待つ。
4. 戻ってきたら `docs/ai/loop-state.md` と `docs/ai/completion-report.md` を読む。
5. 最後に `npm run sensors` を実行する。

## 録画・ログ進行

LIVEで時間が読めない場合は、最初からログ進行に切り替える。

```bash
less ../instructor-materials/full-session-log.txt
less ../instructor-materials/loop-state.md
less ../instructor-materials/completion-report.md
```

## 達成したこと

- 人間が貼るプロンプトで、loop-state、completion-report、停止時のescalation-reportを生成対象として指定できた。
- front-matter付きCRがAIの残作業リストになった。
- `change-package` sensorが、必要成果物と期待挙動の不足を赤として出せた。
- AIがloop-stateに赤、原因、次の方針を記録した。
- completion-reportで、反復回数、センサー結果、変更ファイル、残リスク、人間が見る点を絞れた。
- 人間の途中介入を減らす形を見せられた。
- 人間の役割を、入口でCRを承認すること、出口でdiff/センサー/残リスク/記録を確認することへ寄せられた。

## まだ足りないこと

- 人間の責任は消えない。出口でCRとの整合と残リスクを確認する必要がある。
- センサーが薄い領域は自律化しても守れない。
- max_iterationsや停止条件の設計が甘いと、AIが長く迷う。
- 現場ではCI、権限、外部連携、監視と接続して初めて運用になる。
- 自動生成されたMDは人間の判断を置き換えない。判断が必要な点を出口へ集めるための材料である。

## 分岐

- max_iterations超過: escalation-reportが出た扱いにし、「止まれるAI」の価値へ切り替える。
- 1反復で終わった: 反復回数より、completion-reportの残リスクとセンサー表を読む。
- change-packageが赤のまま: required_artifacts missing と expected_behaviors mismatch を読み上げ、完了契約が出口を絞ることを説明する。

## 戻り方

Slide 23へ戻る。言うことは「入口と出口に絞れるのは、Demo 1から4で足場を増やしたからです。最初からここを目指さないでください」。
