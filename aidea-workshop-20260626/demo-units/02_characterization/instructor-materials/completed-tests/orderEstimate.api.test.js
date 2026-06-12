const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer, postEstimate, itemsForSubtotal } = require('./testHelper');

test('POST /orders/estimate returns standard shipping below threshold', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await postEstimate(baseUrl, itemsForSubtotal(4999));
    assert.equal(res.shippingFee, 500);
    assert.equal(res.message, 'あと1円で送料無料');
  } finally {
    await stopTestServer(server);
  }
});

test('POST /orders/estimate returns free shipping at threshold', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await postEstimate(baseUrl, itemsForSubtotal(5000));
    assert.equal(res.shippingFee, 0);
    assert.equal(res.message, '送料無料');
  } finally {
    await stopTestServer(server);
  }
});

test('POST /orders/estimate preserves response schema', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await postEstimate(baseUrl, itemsForSubtotal(5000));
    assert.deepEqual(Object.keys(res).sort(), [
      'appliedRules',
      'freeShippingRemaining',
      'freeShippingThreshold',
      'message',
      'shippingFee',
      'subtotal',
      'total',
    ]);
  } finally {
    await stopTestServer(server);
  }
});

test('POST /orders/estimate rejects invalid body', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const response = await fetch(baseUrl + '/orders/estimate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.match(body.error, /non-empty/);
  } finally {
    await stopTestServer(server);
  }
});

test('invariant: shippingFee === 0 iff freeShippingRemaining === 0', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    for (const subtotal of [1, 4999, 5000, 6999, 7000, 12000]) {
      const res = await postEstimate(baseUrl, itemsForSubtotal(subtotal));
      if (res.shippingFee === 0) assert.equal(res.freeShippingRemaining, 0);
      else assert.ok(res.freeShippingRemaining > 0);
    }
  } finally {
    await stopTestServer(server);
  }
});

test('large order remains internally consistent', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await postEstimate(baseUrl, itemsForSubtotal(12000));
    assert.equal(res.total, res.subtotal + res.shippingFee);
  } finally {
    await stopTestServer(server);
  }
});

test('message and applied rule agree under threshold', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await postEstimate(baseUrl, itemsForSubtotal(100));
    assert.equal(res.appliedRules[0], 'standard-shipping');
    assert.match(res.message, /あと/);
  } finally {
    await stopTestServer(server);
  }
});

test('message and applied rule agree above threshold', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await postEstimate(baseUrl, itemsForSubtotal(8000));
    assert.equal(res.appliedRules[0], 'free-shipping');
    assert.equal(res.message, '送料無料');
  } finally {
    await stopTestServer(server);
  }
});
