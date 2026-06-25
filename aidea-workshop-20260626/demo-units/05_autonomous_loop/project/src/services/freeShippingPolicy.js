// @ts-check
const { FREE_SHIPPING_THRESHOLD } = require('../config/pricing');

function assertSubtotal(subtotal) {
  if (!Number.isInteger(subtotal) || subtotal < 0) {
    throw new TypeError('subtotal must be a non-negative integer');
  }
}

function freeShippingThreshold() {
  return FREE_SHIPPING_THRESHOLD;
}

function isFreeShipping(subtotal) {
  assertSubtotal(subtotal);
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

function freeShippingRemaining(subtotal) {
  assertSubtotal(subtotal);
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}

module.exports = {
  freeShippingThreshold,
  isFreeShipping,
  freeShippingRemaining,
};
