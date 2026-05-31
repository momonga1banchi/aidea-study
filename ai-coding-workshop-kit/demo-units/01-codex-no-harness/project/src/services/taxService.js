const TAX_RATE = 0.1;

function calculateTax(price) {
  const tax = Math.floor(price * TAX_RATE);

  return {
    price,
    taxRate: TAX_RATE,
    tax,
    total: price + tax,
  };
}

module.exports = { calculateTax };
