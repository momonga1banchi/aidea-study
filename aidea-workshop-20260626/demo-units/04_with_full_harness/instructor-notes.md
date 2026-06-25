# Demo 4: ハーネスありでリリース候補を作る

## このデモで証明したいこと

Demo 1と同じ送料無料変更でも、CR、AGENTS.md、テスト、センサー、記録先が揃うと、AIの作業結果をリリース候補としてレビューできる。ここで見るのはAIの賢さではなく、受け入れ判断に必要な材料が揃ったかである。

## 開始前チェック

```bash
cd project
npm run sensors
rg "5000|threshold|FREE_SHIPPING" src tests docs
```

初期状態は全センサー緑で、5,000円の既存挙動がテストで固定されている。CRには7,000円への変更条件が書かれている。

## 期待筋書き

1. AIがAGENTS.mdとCRを読む。
2. pricing.jsを7,000円へ変更する。
3. characterization testのうち、4999/5000境界は新仕様の受け入れテストとして6999/7000へ書き換える。
4. response形式、不正入力、total計算などの変えてはいけない挙動は回帰テストとして残す。
5. 実装、テスト期待値、spec、ADR、worklogを整える。
6. `npm run sensors` が全緑になり、完了報告に進む。

AIが一発で両方直した場合でも、失敗扱いにしない。センサー、diff、docs更新、worklogが揃っていることを確認し、「なぜレビュー可能か」に話を戻す。

## 実演コマンド

```bash
npm run sensors
rg "5000|7000|threshold|FREE_SHIPPING" src tests docs
less ../instructor-materials/red-to-green.txt
```

Slide 19では、Demo 1で人間がcurlで見ていた矛盾を、今回はテストが赤として表面化させたことを説明する。

## 達成したこと

- 人間が貼るプロンプトで、CR実装、テスト更新、spec/ADR/worklog更新、完了報告までを依頼できた。
- CRで変更範囲、受け入れ条件、対象外を明示できた。
- AGENTS.mdで調査原則、層の責務、記録ルールをAIへ渡せた。
- characterization testで既存挙動を守れた。
- policy-boundary / APIレスポンス形式 / lint / typecheckで振る舞い以外の劣化も見られた。
- spec、ADR、worklogが更新され、判断が次回の前提になった。
- 人間は全コードを読むのではなく、CR、センサー結果、diff、残リスク、記録を確認する役割へ移れる。

## まだ現場で足すこと

- Demo 4で作った成果物は、AIへ明示したプロンプトとGuidesに基づく。現場ではCRテンプレートとAGENTS.mdの保守が必要になる。
- CIで同じセンサーを自動実行する。
- 本番相当データ、外部サービス、権限、監査ログ、性能を確認する。
- デプロイ、ロールバック、監視の手順を用意する。
- 事業側が受け入れ条件を最終確認する。

## AIが一発で両方直した場合

`instructor-materials/red-to-green.txt` を表示する。言うことは「今回は赤が出なかったとしても、赤が出たらこのように止まる設計になっています」。その後、実際の完了条件と記録を読む。

## 戻り方

Slide 21へ戻る。言うことは「ここで初めて、リリース候補として人間がレビューできる材料が揃いました。ただし本番運用の確認は別に残ります」。
