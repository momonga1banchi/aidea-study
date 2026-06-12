# ADR-0001: estimate APIの層構造

## Status

Accepted

## Decision

注文見積りAPIは controller / service / repository / config の層に分ける。
controllerはHTTPの入出力だけを扱い、金額計算はserviceへ置く。
業務上の数値はconfigへ集約する。

## Consequences

層の責務を守ることで、AIエージェントが急ぎの変更をしても構造を保ちやすくなる。
