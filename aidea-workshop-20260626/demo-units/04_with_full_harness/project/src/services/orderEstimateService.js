// @ts-check
const { SHIPPING_FEE } = require('../config/pricing');
const { findProductBySku } = require('../repositories/productRepository');
const {
  freeShippingRemaining,
  freeShippingThreshold,
  isFreeShipping,
} = require('./freeShippingPolicy');
const { normalizeOrderItems } = require('./orderInputService');

/**
 * @typedef {{sku: string, quantity: number}} OrderItem
 * @typedef {{subtotal: number, shippingFee: number, total: number, freeShippingThreshold: number, freeShippingRemaining: number, appliedRules: string[]}} Estimate
 */

/**
 * @param {OrderItem[]} items
 * @returns {Estimate}
 */
function estimateOrder(items) {
  const normalizedItems = normalizeOrderItems(items);
  const subtotal = normalizedItems.reduce((sum, item) => sum + lineSubtotal(item), 0);
  return buildEstimate(subtotal);
}

/**
 * @param {number} subtotal
 * @returns {Estimate}
 */
function estimateOrderBySubtotal(subtotal) {
  if (!Number.isInteger(subtotal) || subtotal < 0) throw new TypeError('subtotal must be a non-negative integer');
  return buildEstimate(subtotal);
}

/**
 * @param {number} subtotal
 * @returns {Estimate}
 */
function buildEstimate(subtotal) {
  const shippingFee = isFreeShipping(subtotal) ? 0 : SHIPPING_FEE;
  const threshold = freeShippingThreshold();
  return {
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    freeShippingThreshold: threshold,
    freeShippingRemaining: freeShippingRemaining(subtotal),
    appliedRules: [shippingFee === 0 ? 'free-shipping' : 'standard-shipping'],
  };
}

/**
 * @param {OrderItem} item
 * @returns {number}
 */
function lineSubtotal(item) {
  if (!item || typeof item.sku !== 'string') throw new TypeError('item.sku is required');
  if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new TypeError('item.quantity must be a positive integer');
  const product = findProductBySku(item.sku);
  return product.price * item.quantity;
}

module.exports = { estimateOrder, estimateOrderBySubtotal, buildEstimate };
