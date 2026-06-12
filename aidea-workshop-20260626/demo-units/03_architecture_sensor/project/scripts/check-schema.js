const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const http = require('node:http');
const { readJson, shapeOf } = require('./sensor-utils');
const { itemsForSubtotal } = require('../tests/testHelper');

(async () => {
  const server = http.createServer(createApp());
  await new Promise(resolve => server.listen(0, resolve));
  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(baseUrl + '/orders/estimate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: itemsForSubtotal(5000) }),
    });
    const actual = shapeOf(await response.json());
    assert.deepEqual(actual, readJson('tests/snapshots/api-schema.json'));
    console.log('[schema] OK: POST /orders/estimate response shape');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error('[schema] NG: ' + error.message);
  process.exit(1);
});
