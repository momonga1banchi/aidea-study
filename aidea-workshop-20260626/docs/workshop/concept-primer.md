# Concept Primer

## ハーネス

ハーネスとは、AIが安全に作業できる足場です。AIが正しく直せるかではなく、人間がリリース判断できる材料を揃えるために使います。

もともとテスト分野では、対象プログラムを動かして確認するための補助環境をテストハーネスと呼びます。この資料ではその発想を、coding agentがコードを読み、編集し、コマンドを実行する開発作業全体へ広げて使います。

Birgitta Böckeler氏はMartin Fowlerサイトの記事で、coding agent利用者のためのハーネスエンジニアリングを、信頼を高めるためのメンタルモデルとして整理しています。要点は、作業前にGuidesで望ましくない出力を予防し、作業後にSensorsで結果を観測して自己修正へ回すことです。

このワークショップでは、記事の考え方をそのまま講義するのではなく、既存システムの保守開発に使える形へ次の3つに分けます。

## Guides

仕様、AGENTS.md、ADR、禁止事項など、AIへ先に渡す情報です。AGENTS.mdはCodex向けの作業規約ファイル名です。Claude CodeのCLAUDE.mdやGeminiのGEMINI.mdと同じ立ち位置のものとして読み替えてください。

## Sensors

テスト、lint、typecheck、policy-boundary、APIレスポンス形式チェックなど、結果を機械で確認する仕組みです。

最初のSensorsは、既存挙動を固定するcharacterization testでよいです。そこから構造、API契約、型、セキュリティへ広げます。

## Steering

人間が重要判断をし、その判断を記録して次回の前提に戻すことです。

Steeringの目的は、人間が全部のコードを読むことではありません。CR、センサー結果、diff、残リスク、記録を見て、次へ進めてよいかを判断することです。

## 用語集

| 用語 | 意味 | この資料での使い方 |
|---|---|---|
| CR | Change Request。変更依頼、背景、受け入れ条件、対象外をまとめる入口です。 | 送料無料条件を7,000円以上へ変更する依頼書として使います。 |
| AGENTS.md | Codex向けの作業規約ファイルです。CLAUDE.mdやGEMINI.mdと同じ立ち位置です。 | 責務境界、テスト実行、記録ルール、触ってよい範囲を渡します。 |
| ADR | Architecture Decision Record。設計判断と理由を短く残す記録です。 | なぜ閾値を設定ファイルへ置くのか、なぜpolicy境界を作るのかを残します。 |
| characterization test | 正しい未来の仕様ではなく、変更前の現在の振る舞いを固定するテストです。 | 4999/5000境界、レスポンス形式、不正入力、不変条件を固定します。 |
| Sensor | 機械的な確認です。赤/緑で、受け入れ前に問題を見つけます。 | test、lint、typecheck、policy-boundary、APIレスポンス形式チェックです。 |
| Steering | 人間が判断し、その判断を次回の前提へ戻すことです。 | diff、worklog、ADR、completion-reportを見て進行可否を決めます。 |

## 2つの仕掛け

1つ目は送料無料閾値がpricing.jsとpromotionService.jsに重複していたため、仕様変更前にfreeShippingPolicyへ責務を寄せる必要があることです。
2つ目は仕様書が3,000円と古い値を持っていることです。

## 参考

- Birgitta Böckeler, "Harness engineering for coding agent users", MartinFowler.com, 2026-04-02.
