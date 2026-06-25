# ADR-0002: 送料無料閾値を7,000円へ変更する

## Status

Accepted

## Context

CR-2026-06-26-free-shipping-threshold により、送料無料ラインを5,000円から7,000円へ引き上げる。
既存のresponse形式、不正入力、total計算は変えない。

## Decision

送料無料閾値は src/config/pricing.js の FREE_SHIPPING_THRESHOLD を7,000へ変更する。
送料無料判定、閾値取得、残額計算は src/services/freeShippingPolicy.js に集約したままにする。

## Consequences

4999/5000境界のcharacterization testは、6999/7000境界の新仕様受け入れテストへ更新する。
APIレスポンス形式とpolicy-boundary sensorは継続して守る。
