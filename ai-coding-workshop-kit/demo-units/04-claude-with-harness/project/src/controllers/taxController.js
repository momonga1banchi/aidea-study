const { calculateTax } = require('../services/taxService');

function parseNonNegativeInteger(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (!/^\d+$/.test(String(value))) {
    return null;
  }

  return Number(value);
}

function getTax(req, res) {
  const price = parseNonNegativeInteger(req.query.price);

  if (price === null) {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'INVALID_PRICE',
        message: 'priceは0以上の整数で指定してください',
      },
    });
  }

  return res.json({
    ok: true,
    data: calculateTax(price),
  });
}

module.exports = { getTax };
