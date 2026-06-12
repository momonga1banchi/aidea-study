# 07. 検収基準と検証手順

納品前に作業LLM自身が全項目を実行し、結果を `aidea-workshop-20260626/BUILD-NOTES.md` に記録する。
**「ファイルが存在する」は検証ではない。各項目はコマンド実行と期待出力の照合で行う。**

## A. コードベース(全demo-unit共通)

| # | 検証 | 期待 |
|---|---|---|
| A1 | `find src -name '*.js' \| wc -l` / `wc -l src/**/*.js` | 8ファイル以上、合計250行以上 |
| A2 | `grep -rn "5000" src/`(全デモ) | pricing.js と promotionService.js の**2箇所**に存在(罠の確認) |
| A3 | tests/が存在するデモで `node --test 2>&1 \| tail -1` | pass、test件数20以上 |
| A4 | `npm run sensors` 所要時間(03/04/05) | 5秒以内、外部ネットワークアクセスなし |
| A5 | `node src/server.js` 起動後 `curl POST /orders/estimate` | 02仕様のレスポンス形状(message含む) |

## B. デモ状態マトリクス(04の表と完全一致すること)

| # | 検証 | 期待 |
|---|---|---|
| B1 | 01/02: `ls tests scripts AGENTS.md` | いずれも存在しない |
| B2 | 03/04: `npm run sensors` | 全緑 |
| B3 | 05: `npm run sensors` | **change-packageのみ赤**。赤出力に required_artifacts 未充足と expected_behaviors 不一致(6999→500 expected, got 0)が列挙される |
| B4 | Demo 1の矛盾再現: pricing.jsだけ7000に変更してcurl(subtotal=6000) | `shippingFee: 500` かつ `message: "送料無料"`(変更を戻して終了) |
| B5 | Demo 3の悪い変更: bad-controller.patch適用後 `node --test` → 緑、`npm run sensor:architecture` → 赤 | 赤出力に「数値リテラル」「controllersから〜禁止」のいずれかが含まれる(パッチを戻すと緑) |
| B6 | 全before状態(01-05)に completion-report / escalation-report / 実績入りloop-state / 生成済みcharacterizationテスト(01/02)が**存在しない** | `find demo-units -name 'completion-report.md' -o -name 'escalation-report.md'` が空 |
| B7 | instructor-prompts/ と instructor-materials/ が各projectの外にあり、project内から参照されていない | grepで確認 |

## C. リハーサル検証(最重要検収)

仕様書類を知らない**新規エージェントセッション**(別スレッド/サブエージェント)に、各デモのinstructor-promptsのプロンプトだけを与えて一時コピー上で実行させる。

- **C1(Demo 2)**: characterizationテスト一式が生成され全緑になる。境界値(4999/5000)と送料・メッセージ整合の検証を含む。
- **C2(Demo 4)**: 全センサー緑+spec/ADR/worklog更新に到達する。途中で不変条件テストの赤が発生した場合、その出力ログをスライド19用に採取する(赤が発生しなかった場合は、pricing.jsのみ変更した状態を手動で作って赤出力を採取する)。
- **C3(Demo 5)**: 人間介入なしでcompletion-reportに到達し、loop-stateに記録が残り、scripts/とtests/の既存ファイルが変更されていない。**録画またはフルログを採取して instructor-materials/ に同梱する**(フォールバック素材を兼ねる)。

一発で通らない場合、AGENTS.mdの文言・センサーの赤メッセージ・プロンプトを調整して再試行する。**調整の履歴をBUILD-NOTES.mdに残す。**

## D. バージョン概念の混入チェック(自動化必須)

| # | 検証 | 期待 |
|---|---|---|
| D1 | 納品物全体(PPTX内テキスト含む)に対し `grep -ri -E "v(8\|9\|1[0-9])([^0-9]\|$)\|前回の(試行\|資料\|バージョン)\|前バージョン\|改善点" を実行(PPTXは展開してXMLをgrep) | ヒット0件。ただしNode/TypeScript等のソフトウェアバージョン表記(node 20, typescript@5)は除外してよい |
| D2 | 成果物ディレクトリ名・ファイル名にバージョン番号がない | `find . -iname '*v[0-9]*'` がヒット0件 |

## E. ドキュメント

| # | 検証 | 期待 |
|---|---|---|
| E1 | facilitator-guide.md | 06の構成6項目を含み150行以上。想定質問10問以上 |
| E2 | 各instructor-notes.md | 04の必須5項目を含む |
| E3 | concept-primer.md / first-steps-checklist.md | スライド8-9/26と内容が一致 |
| E4 | README.md | 使い方、デモ一覧、create-fresh-run.shの手順、LIVE実演の安全策 |

## F. PPTX

| # | 検証 | 期待 |
|---|---|---|
| F1 | スライド枚数 | 28±2 |
| F2 | 全スライドをPNGへレンダリングし目視確認 | 空プレースホルダなし、オーバーフローなし、各スライドに本文と図がある。画像一式と確認メモを outputs/qa/ に残す |
| F3 | 実物を見せるスライド(11,13,14,15,16,17,18,19,21,22,23) | 完成デモから採取した出力と一致する(創作出力でない) |
| F4 | 話者ノート | 全スライドに存在、各2文以上 |
| F5 | 圧縮時スキップ順 | facilitator-guideに記載があり、スライド3,4,10,13,19,27が「削らない」に指定されている |

## G. verify-kit.sh

A・B・D・E1・F1 を自動化したスクリプトとして実装する(CとF2-F4は手動検証でよいが、手順と結果をBUILD-NOTES.mdに書く)。チェック内容は本書の表と1対1対応させ、項目番号(A1, B3, D1...)を出力に含める。

## 納品物(再掲)

00_MASTER-PROMPT.md「成果物の置き場所」のツリーに従う。BUILD-NOTESには検収実行ログ・未完了項目・リハーサル調整履歴を含めること。
