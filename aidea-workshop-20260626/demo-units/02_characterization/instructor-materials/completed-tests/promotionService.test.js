const test = require('node:test');
const assert = require('node:assert/strict');
const { freeShippingRemaining } = require('../src/services/promotionService');

test('remaining is full threshold at zero subtotal', () => {
  assert.equal(freeShippingRemaining(0), 5000);
});

test('remaining decreases below threshold', () => {
  assert.equal(freeShippingRemaining(4999), 1);
});

test('remaining is zero at threshold', () => {
  assert.equal(freeShippingRemaining(5000), 0);
});

test('remaining is zero above threshold', () => {
  assert.equal(freeShippingRemaining(12000), 0);
});
