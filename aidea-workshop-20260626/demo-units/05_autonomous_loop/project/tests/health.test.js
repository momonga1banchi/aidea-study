const test = require('node:test');
const assert = require('node:assert/strict');
const { getHealth, getMissing } = require('./testHelper');

test('GET /health returns ok', async () => {
  const response = await getHealth();
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('unknown route returns 404', async () => {
  const response = await getMissing();
  assert.equal(response.status, 404);
});
