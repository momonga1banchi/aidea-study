// @ts-check
const PRODUCTS = new Map([
  ['UNIT-001', { sku: 'UNIT-001', name: '調整用1円商品', price: 1 }],
  ['BOOK-001', { sku: 'BOOK-001', name: '業務本', price: 1800 }],
  ['MUG-001', { sku: 'MUG-001', name: 'マグカップ', price: 1200 }],
  ['BAG-001', { sku: 'BAG-001', name: 'トートバッグ', price: 2400 }],
  ['PEN-001', { sku: 'PEN-001', name: 'ペンセット', price: 600 }],
]);

/**
 * @param {string} sku
 * @returns {{sku: string, name: string, price: number}}
 */
function findProductBySku(sku) {
  const product = PRODUCTS.get(sku);
  if (!product) throw new TypeError('unknown sku: ' + sku);
  return product;
}

function listProducts() {
  return Array.from(PRODUCTS.values());
}

module.exports = { findProductBySku, listProducts };
