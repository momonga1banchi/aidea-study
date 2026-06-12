const test = require('node:test');
const assert = require('node:assert/strict');
const { estimateOrder, estimateOrderBySubtotal } = require('../src/services/orderEstimateService');

test('estimateOrder calculates subtotal from products', () => {
  const result = estimateOrder([{ sku: 'BOOK-001', quantity: 2 }]);
  assert.equal(result.subtotal, 3600);
  assert.equal(result.shippingFee, 500);
});

test('estimateOrder applies free shipping at 5000', () => {
  const result = estimateOrder([{ sku: 'UNIT-001', quantity: 5000 }]);
  assert.equal(result.shippingFee, 0);
  assert.equal(result.total, 5000);
});

test('estimateOrderBySubtotal mirrors normal pricing logic below threshold', () => {
  const result = estimateOrderBySubtotal(4999);
  assert.equal(result.shippingFee, 500);
  assert.equal(result.appliedRules[0], 'standard-shipping');
});

test('estimateOrderBySubtotal mirrors normal pricing logic at threshold', () => {
  const result = estimateOrderBySubtotal(5000);
  assert.equal(result.shippingFee, 0);
  assert.equal(result.appliedRules[0], 'free-shipping');
});

test('rejects empty items', () => {
  assert.throws(() => estimateOrder([]), /non-empty/);
});

test('rejects unknown sku', () => {
  assert.throws(() => estimateOrder([{ sku: 'NOPE', quantity: 1 }]), /unknown sku/);
});

test('rejects invalid quantity', () => {
  assert.throws(() => estimateOrder([{ sku: 'BOOK-001', quantity: 0 }]), /positive integer/);
});
