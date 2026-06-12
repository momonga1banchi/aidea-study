# Demo 4: ハーネスありで同じ変更を頼む

## このデモで証明したいこと

CR、AGENTS.md、テスト、センサーが揃うと、AIは赤を見て原因を探し、重複箇所まで直せる。人間は逐一実装を監視するのではなく、赤から緑への根拠を見る。

## 期待筋書き

1. AIがpricing.jsを7,000円へ変更する。
2. APIの不変条件テストが赤になる。
3. `rg "5000|threshold|FREE_SHIPPING" src tests docs` でpromotionService.jsの重複を見つける。
4. promotionService.jsとテスト境界値を更新する。
5. `npm run sensors` が全緑になる。
6. spec / ADR / worklogを更新して完了報告する。

## 実演コマンド

```bash
cd project
npm run sensors
rg "5000|threshold|FREE_SHIPPING" src tests docs
```

## AIが一発で両方直した場合

M5の赤→緑ログを表示する。

```bash
less ../instructor-materials/red-to-green.txt
```

「今回は一発で直ったが、なぜOKと言えるか」を問い、センサー表と成果物更新へ話を戻す。

## フォールバック

`instructor-materials/red-to-green.txt` を表示する。pricingだけ変更した赤テスト、重複発見、全緑sensors表の順で読める。

## 戻り方

Slide 19へ戻り、赤テストと全緑表の時系列を説明する。
