const assert = require('node:assert/strict');
const { readJson, shapeOf } = require('./sensor-utils');
const { postEstimate, itemsForSubtotal } = require('../tests/testHelper');

(async () => {
  const actual = shapeOf(await postEstimate(itemsForSubtotal(5000)));
  assert.deepEqual(actual, readJson('tests/snapshots/api-schema.json'));
  console.log('[api-response] OK: POST /orders/estimate response shape');
})().catch(error => {
  console.error('[api-response] NG: ' + error.message);
  process.exit(1);
});
