# ADR-0001: estimate APIの層構造

## Status

Accepted

## Decision

注文見積りAPIは controller / service / repository / config の層に分ける。
controllerはHTTPの入出力だけを扱い、金額計算はserviceへ置く。
業務上の設定値はconfigへ置く。
送料無料判定、閾値取得、残額計算はfreeShippingPolicyへ集約する。

## Consequences

層の責務とpolicy境界を守ることで、AIエージェントが急ぎの変更をしても修正漏れを生みにくくなる。
