const http = require('node:http');
const { createApp } = require('../src/app');

async function startTestServer() {
  const server = http.createServer(createApp());
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function stopTestServer(server) {
  await new Promise(resolve => server.close(resolve));
}

async function postEstimate(baseUrl, items) {
  const response = await fetch(baseUrl + '/orders/estimate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return response.json();
}

function itemsForSubtotal(subtotal) {
  return [{ sku: 'UNIT-001', quantity: subtotal }];
}

module.exports = { startTestServer, stopTestServer, postEstimate, itemsForSubtotal };
