const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer } = require('./testHelper');

test('GET /health returns ok', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const response = await fetch(baseUrl + '/health');
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  } finally {
    await stopTestServer(server);
  }
});

test('unknown route returns 404', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const response = await fetch(baseUrl + '/missing');
    assert.equal(response.status, 404);
  } finally {
    await stopTestServer(server);
  }
});
