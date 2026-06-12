// @ts-check
/**
 * Controllerから渡された注文行を、計算サービスが扱いやすい形へ正規化する。
 * HTTPの責務ではないが、金額計算そのものでもないため独立させている。
 *
 * @typedef {{sku: string, quantity: number}} OrderItem
 */

/**
 * @param {unknown} items
 * @returns {OrderItem[]}
 */
function normalizeOrderItems(items) {
  assertNonEmptyArray(items);
  return items.map((item, index) => normalizeOrderItem(item, index));
}

/**
 * @param {unknown} items
 * @returns {asserts items is unknown[]}
 */
function assertNonEmptyArray(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError('items must be a non-empty array');
  }
}

/**
 * @param {unknown} item
 * @param {number} index
 * @returns {OrderItem}
 */
function normalizeOrderItem(item, index) {
  if (!isRecord(item)) {
    throw new TypeError(`items[${index}] must be an object`);
  }
  return {
    sku: normalizeSku(item.sku, index),
    quantity: normalizeQuantity(item.quantity, index),
  };
}

/**
 * @param {unknown} sku
 * @param {number} index
 * @returns {string}
 */
function normalizeSku(sku, index) {
  if (typeof sku !== 'string' || sku.trim() === '') {
    throw new TypeError(`items[${index}].sku is required`);
  }
  return sku.trim().toUpperCase();
}

/**
 * @param {unknown} quantity
 * @param {number} index
 * @returns {number}
 */
function normalizeQuantity(quantity, index) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new TypeError(`items[${index}].quantity must be a positive integer`);
  }
  return quantity;
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * @param {OrderItem[]} items
 * @returns {string}
 */
function summarizeOrderItems(items) {
  return items.map(item => `${item.sku} x ${item.quantity}`).join(', ');
}

module.exports = {
  normalizeOrderItems,
  summarizeOrderItems,
};
