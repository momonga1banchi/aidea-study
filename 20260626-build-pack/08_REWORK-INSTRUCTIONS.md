# 08. 再作業指示書(レビュー指摘の修正)

対象: `aidea-workshop-20260626/`(2026-06-12レビューで不合格)
あなたはこの指示書と既存ビルドパック(00-07)に従い、**差し替え再作業**を行う。ゼロからの作り直しは禁止。

## 触ってはいけないもの(レビュー合格済み)

以下は実機検証済みで合格している。**R1で指定するtypecheck以外、1文字も変更しない。**

- 全demo-unitの `project/src`、`project/tests`、`project/docs`(specs/ADR/CR/ai テンプレート)
- scripts/ のセンサー群(typecheck.jsを除く)、run-sensors.js、architecture-allowlist.json
- 各demo-unitの状態マトリクス(tests/scripts/AGENTS.mdの有無、CRのstatus)
- instructor-prompts/run-demo.md(全デモ)
- facilitator-guideの「想定質問と答え」セクション(これは合格品質。残す)

## 不合格理由の要約(再演したら再不合格)

1. facilitator-guideの台本が28スライド全部同一のコピペ文
2. instructor-notesが5デモほぼ同一テンプレ(進行手順・分岐が皆無)
3. スライドの「実物出力」が創作・使い回し(Slide 19がSlide 13と同一のcurl断片)
4. リハーサルC1-C3の実施痕跡なし、フォールバック「ログ」が5行の要約文
5. typecheckが `node --check` に無申告で簡略化(検査対象もハードコード)

**今回の検収を「通す」ことを目的にしない。検収は症状の検出器であり、原因(中身の空洞)を直すこと。**

---

## R1. typecheckセンサーの是正(03/04/05の全project)

- `tsc --noEmit`(checkJs、同梱tsconfig使用)を第一手段とする。実行は `npx --no-install typescript ...` → グローバルtsc の順で探す。
- どちらも無い場合は `node --check`(全src/scripts/testsを**動的列挙**)へ降格し、出力に **`[typecheck] WARN: tsc未検出のため構文チェックのみ`** と明示する。黙って降格しない。
- ファイルリストのハードコード禁止。globで列挙する(新規ファイルが自動的に検査対象になること)。
- 検証: 一時コピーで `src/services/promotionService.js` に `/** @type {string} */ const x = 1;` を追加 → tscがある環境で赤になること。元に戻して緑。
- 当日環境にtscが無い可能性は facilitator-guide の機材チェックリストに「`npx --no-install typescript tsc -v` を事前確認」として追記する。

## R2. 実物素材の採取(すべての後続作業の前提)

完成済みデモを**実際に実行**し、以下を採取して各 `instructor-materials/` に保存する。要約文の捏造は不可。ターミナル出力はコマンド行を含む生ログ(ANSIエスケープは除去可)。

| # | 採取物 | 採取方法 | 保存先 |
|---|---|---|---|
| M1 | Demo 1の矛盾curl出力 | 01のコピーでpricing.jsのみ7000化→server起動→subtotal=6000をPOST(変更は破棄) | 01/instructor-materials/contradiction-curl.txt |
| M2 | Demo 1のAI実行ログ | 新規セッションにrun-demo.mdを与えた実録 | 01/instructor-materials/session-log.txt |
| M3 | Demo 2の生成テスト+実行ログ | 既存completed-testsは流用可。`node --test`の生出力を追加採取 | 02/instructor-materials/ |
| M4 | Demo 3のtest緑+architecture赤 | patch適用→`node --test`と`npm run sensors`の生出力(**適用コマンド `patch -p0 < ...` を冒頭に記録**) | 03/instructor-materials/red-output.txt |
| M5 | Demo 4の赤→緑の時系列 | C2リハーサル(R5)から採取。不変条件テスト赤の生出力と、修復後の全緑sensors表 | 04/instructor-materials/red-to-green.txt |
| M6 | Demo 5のフルログ+completion-report+loop-state実績 | C3リハーサル(R5)の作業コピーから採取 | 05/instructor-materials/ |

## R3. PPTXの差し替え

- F3対象スライド(11,13,14,15,16,17,18,19,21,22,23)の「実物」をR2の採取物と一致させる。特に:
  - Slide 13: M1の実レスポンス(矛盾箇所が読める形)
  - Slide 19: M5の**赤テスト出力→全緑sensors表の時系列**(curl断片の再掲は不可)
  - Slide 22: 3行プロンプトとfront-matter付きCRの実物
  - Slide 23: M6のcompletion-report抜粋+Demo1/4/5の介入回数比較表
- ターミナル風ボックスの空白過多を解消する(表示内容に合わせた箱のサイズ。3行のために巨大な黒箱を置かない)。
- 話者ノートを全28枚、**そのスライド固有の内容**で書き直す。定型文(「このスライドでは〜を説明します」「次のデモで何を見るべきか」)の使い回し禁止。各ノートは「話す内容の要点+進行上の注意(間の取り方・問いかけ・切り替え先)」の2要素を含む。
- 再レンダリングして qa/ を更新し、slide-review-notes.md には**スライドごと**の確認結果(1行ずつ、指摘ゼロでも「枚数分の行」)を書く。

## R4. facilitator-guide台本の書き直し

- 「セクションごとの台本」を全面書き直し。スライド1枚ごとではなく**8つの進行ブロック**(オープニング/持ち帰り・問い/考え方/デモ1/デモ2/デモ3/デモ4/ボーナス・まとめ)単位でよいが、各ブロックに:
  - 言うこと: 話し言葉のスクリプト(そのまま読める文。ブロックごとに固有)
  - 見せる画面: スライド番号と、ターミナルに切り替えるタイミング・実行するコマンド(コピペ可能な形)
  - 戻り方: デモ後にどのスライドへ戻るか
- Demo 3ブロックには `patch -p0 < ../instructor-materials/bad-controller.patch` を明記。
- 時間圧縮のスキップ順(22-23→16→5、削らない: 3,4,10,13,19,27)を明記。
- 想定質問セクションは現状維持。

## R5. リハーサルC1-C3の実施(証跡必須)

07のC項を**実際に新規エージェントセッションで実行**する。各リハーサルについて、BUILD-NOTESに「実行日時/使ったプロンプト/反復回数/結果/調整した点」を記録し、生ログをR2の保存先に置く。
C2で不変条件テストの赤が自然発生しなかった場合は、その旨を記録した上で、pricing.jsのみ変更した状態を手動で作って赤出力を採取する(M5)。

## R6. instructor-notesの書き直し(5デモ個別)

04の必須5項目をデモ固有の内容で書く。最低限含めるべき固有要素:

- 01: 矛盾の種明かし手順(コピペ可能なcurl)、AIが重複まで直してしまった場合の切り返し(specの3,000円へ誘導)
- 02: 生成が3分を超えた場合のcompleted-testsへの差し替え手順、古い仕様書への言及がなかった場合の問いかけ
- 03: patchコマンド(-p0)、**test緑→architecture赤の順**で見せること、allowlist(既知の負債)の一言
- 04: 期待筋書き(赤→全文検索→重複発見→緑)と、AIが一発で両方直した場合のM5提示手順
- 05: LIVE/録画それぞれの進行、max_iterations超過時・1反復で終わった時の分岐

## R7. verify-kitの強化(検収の形骸化対策)

- **台本ユニーク性**: facilitator-guideの「言うこと」、instructor-notes 5本、PPTX話者ノート28枚それぞれについて、正規化(空白除去)した文の重複率を検査。同一文が3回以上出現したらFAIL。
- **F3整合**: F3対象スライドのXMLテキストに、対応するinstructor-materials採取物の特徴行(例: `got 0`、`shippingFee": 500`、`| architecture | red |`)が含まれることを検査。
- **typecheck実効性**: 一時コピーに型エラーを注入して typecheck が赤になる(tsc存在時)、またはWARN付き降格メッセージが出ることを検査。
- チェック項目はR番号と対応付けて出力する。

## BUILD-NOTESの更新

- 「未完了項目: なし」と書く前に、本指示書R1-R7の各項目の実施結果を列挙する。
- 簡略化・降格・未実施が1つでもあれば、未完了項目として理由付きで明記する。**虚偽の「なし」は再不合格の最優先事由。**

## 検収(再レビューで実行されるコマンド)

1. `bash scripts/verify-kit.sh` 全PASS(R7強化版で)
2. `diff <(sed 1d demo-units/01_no_harness/instructor-notes.md) <(sed 1d demo-units/03_architecture_sensor/instructor-notes.md)` → 大量の差分があること
3. Slide 19のテキストに赤テスト出力由来の行が含まれ、Slide 13と本文が一致しないこと
4. `grep -c 'このスライドでは' ppt/notesSlides/*.xml` 由来の定型文が0であること
5. demo-units/0{1..5}/instructor-materials/ にR2の採取物が揃っていること
6. BUILD-NOTESにC1-C3の実行記録があること
