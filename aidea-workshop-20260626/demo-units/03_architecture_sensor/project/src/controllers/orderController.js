// @ts-check
const { estimateOrder } = require('../services/orderEstimateService');

/**
 * @param {{items?: Array<{sku: string, quantity: number}>}} payload
 */
async function handleOrderEstimate(payload) {
  try {
    const estimate = estimateOrder(payload.items);
    return {
      status: 200,
      body: {
        ...estimate,
        message: estimate.freeShippingRemaining > 0
          ? `あと${estimate.freeShippingRemaining}円で送料無料`
          : '送料無料',
      },
    };
  } catch (error) {
    if (error instanceof TypeError) {
      return { status: 400, body: { error: error.message } };
    }
    throw error;
  }
}
module.exports = { handleOrderEstimate };
