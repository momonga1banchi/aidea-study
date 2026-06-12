// @ts-check
/**
 * 送料無料まであといくらかを返す。0なら送料無料圏内。
 * NOTE: 2024年のキャンペーン実装時に追加。閾値が config/pricing.js と重複している。
 * TODO: pricing.js へ寄せる (PROMO-412)
 * @param {number} subtotal
 * @returns {number}
 */
function freeShippingRemaining(subtotal) {
  const threshold = 5000;
  return Math.max(0, threshold - subtotal);
}
module.exports = { freeShippingRemaining };
