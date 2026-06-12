# Demo 2: 既存挙動をcharacterization testで固定する

## このデモで証明したいこと

古い仕様書を先に信じるのではなく、コードと実レスポンスから現状の振る舞いを固定する。AIにいきなり実装させる前に、境界値と不変条件をテスト化する価値を見せる。

## 開始前チェック

```bash
cd project
rg "3,000|5000|FREE_SHIPPING" docs src
```

仕様書は3,000円、コードは5,000円で食い違っていることを確認する。

## 実演手順

1. run-demo.mdをAIに渡し、テスト生成を依頼する。
2. AIが仕様書の3,000円を根拠にしそうなら、実レスポンス確認を促す。
3. 境界値4999/5000、APIスキーマ、不変条件を含むかを見る。
4. 生成に3分以上かかる場合は、completed-testsをproject/testsへコピーして続行する。

## completed-testsへの差し替え

```bash
mkdir -p project/tests
cp instructor-materials/completed-tests/*.js project/tests/
cd project
node --test
```

## 古い仕様書への言及がなかった場合

「docs/specs/order-estimate.md と実レスポンスは一致しているか」と質問し、AIに差分を説明させる。ここで仕様書を更新する必要はない。目的は、現状固定の前にドキュメントを盲信しないこと。

## フォールバック

`instructor-materials/test-run-output.txt` を表示する。node --testの生ログが入っている。

## 戻り方

Slide 15へ戻り、「テストはAIの足場になるが、テスト観点は人間が見る」に接続する。
