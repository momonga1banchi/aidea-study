# Demo 3: テスト緑でも構造違反を止める

## このデモで証明したいこと

テストが緑でも、controllerへ業務閾値を直書きする変更は設計負債になる。architecture sensorは、動作結果ではなく責務境界を守るためのセンサーである。

## 開始前チェック

```bash
cd project
npm run sensors
```

初期状態では全センサー緑であることを確認する。

## 実演手順

1. bad-controller.patchを適用する。

```bash
patch -p0 < ../instructor-materials/bad-controller.patch
```

2. 先にテストを見せる。

```bash
node --test
```

3. 次に構造センサーを見せる。

```bash
npm run sensor:architecture
```

順番は必ず test緑 → architecture赤。ここを逆にすると、参加者が「ただのlint失敗」と受け取る。

## allowlistの説明

promotionService.jsに残っている閾値重複は既知負債としてallowlistに入れている。センサーは現実の負債を全部消してから始めるものではなく、増やしてはいけない場所を決めるもの。

## フォールバック

`instructor-materials/red-output.txt` を表示する。patchコマンド、node --test、npm run sensorsの生出力が入っている。

## 戻り方

Slide 16へ戻り、「動けばOKではなく、AIにも守ってほしい構造を渡す」に接続する。
