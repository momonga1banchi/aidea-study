#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
pass(){ printf 'PASS %s: %s\n' "$1" "$2"; }
fail(){ printf 'FAIL %s: %s\n' "$1" "$2" >&2; exit 1; }
start_demo_server(){ local project="$1"; local port="$2"; (cd "$project" && HOST=127.0.0.1 PORT="$port" node src/server.js) >/tmp/aidea-server-"$port".log 2>&1 & echo "$!"; }
stop_demo_server(){ local pid="$1"; kill "$pid" >/dev/null 2>&1 || true; wait "$pid" >/dev/null 2>&1 || true; }

for unit in "$ROOT_DIR"/demo-units/*/project; do
  js_count="$(find "$unit/src" -name '*.js' | wc -l | tr -d ' ')"
  line_count="$(find "$unit/src" -name '*.js' -print0 | xargs -0 wc -l | tail -1 | awk '{print $1}')"
  [ "$js_count" -ge 8 ] && [ "$line_count" -ge 250 ] || fail A1 "$unit src規模不足"
done
pass A1 "全demo-unitのsrcは8ファイル以上、250行以上"

for unit in 01_no_harness 02_characterization; do
  project="$ROOT_DIR/demo-units/$unit/project"
  hits="$(grep -R "5000" "$project/src" | wc -l | tr -d ' ')"
  [ "$hits" -eq 2 ] || fail A2 "$unit 5000の出現数が2ではない: $hits"
done
for unit in 03_architecture_sensor 04_with_full_harness 05_autonomous_loop; do
  project="$ROOT_DIR/demo-units/$unit/project"
  hits="$(grep -R "5000" "$project/src" | wc -l | tr -d ' ')"
  [ "$hits" -eq 1 ] || fail A2 "$unit 5000はconfigだけに残る想定: $hits"
  grep -q "require('./freeShippingPolicy')" "$project/src/services/promotionService.js" || fail A2 "$unit promotionServiceがpolicyを使っていない"
done
pass A2 "01/02は重複あり、03以降はfreeShippingPolicyへ集約"

for unit in 03_architecture_sensor 04_with_full_harness 05_autonomous_loop; do
  project="$ROOT_DIR/demo-units/$unit/project"
  output="$(cd "$project" && node --test 2>&1)"
  printf '%s\n' "$output" | grep -q "# pass" || fail A3 "$unit node --test がpassしない"
  count="$(printf '%s\n' "$output" | awk '/# tests/{print $3}' | tail -1)"
  [ "$count" -ge 20 ] || fail A3 "$unit test件数不足: $count"
done
pass A3 "testsがあるデモはnode --test pass、20件以上"

for unit in 03_architecture_sensor 04_with_full_harness; do
  project="$ROOT_DIR/demo-units/$unit/project"
  for cmd in test lint sensor:architecture sensor:api-response; do
    start="$(date +%s)"
    (cd "$project" && npm run "$cmd" >/tmp/aidea-sensor-$unit-$cmd.log)
    elapsed="$(( $(date +%s) - start ))"
    [ "$elapsed" -le 5 ] || fail A4 "$unit $cmd が5秒超"
  done
  start="$(date +%s)"
  (cd "$project" && npm run typecheck >/tmp/aidea-sensor-$unit-typecheck.log)
  elapsed="$(( $(date +%s) - start ))"
  [ "$elapsed" -le 15 ] || fail A4 "$unit typecheckが15秒超"
done
pass A4 "03/04 sensorsはtypecheck除き5秒以内、typecheckは15秒以内で全緑"

a5_pid="$(start_demo_server "$ROOT_DIR/demo-units/04_with_full_harness/project" 31026)"
sleep 1
curl_output="$(curl --max-time 3 -sS -X POST http://127.0.0.1:31026/orders/estimate -H 'content-type: application/json' -d '{"items":[{"sku":"UNIT-001","quantity":5000}]}')" || { stop_demo_server "$a5_pid"; fail A5 "curl失敗"; }
stop_demo_server "$a5_pid"
printf '%s\n' "$curl_output" | grep -q '"message":"送料無料"' || fail A5 "curlレスポンスにmessageがない"
pass A5 "curlでPOST /orders/estimateを確認"

for unit in 01_no_harness 02_characterization; do
  project="$ROOT_DIR/demo-units/$unit/project"
  [ ! -e "$project/tests" ] && [ ! -e "$project/scripts" ] && [ ! -e "$project/AGENTS.md" ] || fail B1 "$unit before状態にtests/scripts/AGENTSがある"
done
pass B1 "01/02にはtests/scripts/AGENTSなし"

for unit in 03_architecture_sensor 04_with_full_harness; do
  (cd "$ROOT_DIR/demo-units/$unit/project" && npm run sensors >/tmp/aidea-$unit-sensors.log)
done
pass B2 "03/04はnpm run sensors全緑"

set +e
b3_output="$(cd "$ROOT_DIR/demo-units/05_autonomous_loop/project" && npm run sensors 2>&1)"
b3_status=$?
set -e
[ "$b3_status" -ne 0 ] || fail B3 "05が初期全緑になっている"
printf '%s\n' "$b3_output" | grep -q "change-package" || fail B3 "change-package赤が出ていない"
printf '%s\n' "$b3_output" | grep -q "required_artifacts" || fail B3 "required_artifacts未充足が出ていない"
printf '%s\n' "$b3_output" | grep -q "expected_behaviors" || fail B3 "expected_behaviors不一致が出ていない"
pass B3 "05はchange-packageのみ赤"

tmp="$(mktemp -d)"
cp -R "$ROOT_DIR/demo-units/01_no_harness/project" "$tmp/project"
perl -0pi -e 's/FREE_SHIPPING_THRESHOLD = 5000/FREE_SHIPPING_THRESHOLD = 7000/' "$tmp/project/src/config/pricing.js"
b4_pid="$(start_demo_server "$tmp/project" 31027)"
sleep 1
b4="$(curl --max-time 3 -sS -X POST http://127.0.0.1:31027/orders/estimate -H 'content-type: application/json' -d '{"items":[{"sku":"UNIT-001","quantity":6000}]}')" || { stop_demo_server "$b4_pid"; fail B4 "curl失敗"; }
stop_demo_server "$b4_pid"
printf '%s\n' "$b4" | grep -q '"shippingFee":500' && printf '%s\n' "$b4" | grep -q '"message":"送料無料"' || fail B4 "Demo1矛盾が再現しない"
pass B4 "Demo1の矛盾レスポンス再現"

tmp3="$(mktemp -d)"
cp -R "$ROOT_DIR/demo-units/03_architecture_sensor/project" "$tmp3/project"
(cd "$tmp3/project" && patch -p0 < "$ROOT_DIR/demo-units/03_architecture_sensor/instructor-materials/bad-policy-duplication.patch" >/dev/null)
(cd "$tmp3/project" && node --test >/tmp/aidea-bad-test.log)
set +e
arch_output="$(cd "$tmp3/project" && npm run sensor:architecture 2>&1)"
arch_status=$?
set -e
[ "$arch_status" -ne 0 ] || fail B5 "悪い変更でpolicy-boundaryが赤にならない"
printf '%s\n' "$arch_output" | grep -E "policy-boundary|送料無料閾値|freeShippingPolicy" >/dev/null || fail B5 "赤出力が期待形式でない"
pass B5 "悪い変更はtest緑、policy-boundary赤"

find "$ROOT_DIR"/demo-units/*/project \( -name 'completion-report.md' -o -name 'escalation-report.md' \) | grep -q . && fail B6 "before状態に完了後成果物が混入" || true
pass B6 "before状態にcompletion/escalation reportなし"

grep -R "instructor-prompts\|instructor-materials" "$ROOT_DIR"/demo-units/*/project >/tmp/aidea-promptrefs.log 2>/dev/null && fail B7 "project内から講師資料参照あり" || true
pass B7 "講師資料はproject外"

node "$ROOT_DIR/scripts/version-mixing-check.js" "$ROOT_DIR"
pass D1 "制作履歴・資料番号の混入なし"

find "$ROOT_DIR" -iname '*v[0-9]*' | grep -q . && fail D2 "ファイル名に禁止パターンあり" || true
pass D2 "成果物名に禁止パターンなし"

[ "$(wc -l < "$ROOT_DIR/docs/workshop/facilitator-guide.md")" -ge 150 ] || fail E1 "facilitator-guideが150行未満"
[ "$(grep -c '^### Q' "$ROOT_DIR/docs/workshop/facilitator-guide.md")" -ge 10 ] || fail E1 "想定質問が10問未満"
pass E1 "facilitator-guide条件OK"

slide_count="$(python3 - <<PY
import zipfile
p='$ROOT_DIR/outputs/aidea-workshop-20260626.pptx'
z=zipfile.ZipFile(p)
print(sum(1 for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')))
PY
)"
[ "$slide_count" -ge 26 ] && [ "$slide_count" -le 32 ] || fail F1 "PPTX枚数が範囲外: $slide_count"
pass F1 "PPTXは${slide_count}枚"

node "$ROOT_DIR/scripts/rework-verify.js" "$ROOT_DIR"
pass R7 "再作業検査OK"

printf '\nAll checks passed.\n'
