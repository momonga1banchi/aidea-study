const test = require('node:test');
const assert = require('node:assert/strict');
const { postEstimate, postEstimateResponse, itemsForSubtotal } = require('./testHelper');

test('POST /orders/estimate returns standard shipping below threshold', async () => {
  const res = await postEstimate(itemsForSubtotal(4999));
  assert.equal(res.shippingFee, 500);
  assert.equal(res.message, 'あと1円で送料無料');
});

test('POST /orders/estimate returns free shipping at threshold', async () => {
  const res = await postEstimate(itemsForSubtotal(5000));
  assert.equal(res.shippingFee, 0);
  assert.equal(res.message, '送料無料');
});

test('POST /orders/estimate preserves API response shape', async () => {
  const res = await postEstimate(itemsForSubtotal(5000));
  assert.deepEqual(Object.keys(res).sort(), [
    'appliedRules',
    'freeShippingRemaining',
    'freeShippingThreshold',
    'message',
    'shippingFee',
    'subtotal',
    'total',
  ]);
});

test('POST /orders/estimate rejects invalid body', async () => {
  const response = await postEstimateResponse([]);
  assert.equal(response.status, 400);
  assert.match(response.body.error, /non-empty/);
});

test('invariant: shippingFee === 0 iff freeShippingRemaining === 0', async () => {
  for (const subtotal of [1, 4999, 5000, 6999, 7000, 12000]) {
    const res = await postEstimate(itemsForSubtotal(subtotal));
    if (res.shippingFee === 0) assert.equal(res.freeShippingRemaining, 0);
    else assert.ok(res.freeShippingRemaining > 0);
  }
});

test('large order remains internally consistent', async () => {
  const res = await postEstimate(itemsForSubtotal(12000));
  assert.equal(res.total, res.subtotal + res.shippingFee);
});

test('message and applied rule agree under threshold', async () => {
  const res = await postEstimate(itemsForSubtotal(100));
  assert.equal(res.appliedRules[0], 'standard-shipping');
  assert.match(res.message, /あと/);
});

test('message and applied rule agree above threshold', async () => {
  const res = await postEstimate(itemsForSubtotal(8000));
  assert.equal(res.appliedRules[0], 'free-shipping');
  assert.equal(res.message, '送料無料');
});
