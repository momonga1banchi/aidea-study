const { Readable } = require('node:stream');
const { createApp } = require('../src/app');

async function request(method, url, payload) {
  const app = createApp();
  const body = payload === undefined ? '' : JSON.stringify(payload);
  const req = Readable.from(body ? [body] : []);
  req.method = method;
  req.url = url;
  req.headers = body ? { 'content-type': 'application/json' } : {};

  const chunks = [];
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(chunk) {
      if (chunk) chunks.push(Buffer.from(chunk));
    },
  };

  await app(req, res);
  const text = Buffer.concat(chunks).toString('utf8');
  return { status: res.statusCode, body: text ? JSON.parse(text) : undefined };
}

async function getHealth() {
  return request('GET', '/health');
}

async function getMissing() {
  return request('GET', '/missing');
}

async function postEstimateResponse(items) {
  return request('POST', '/orders/estimate', { items });
}

async function postEstimate(items) {
  const response = await postEstimateResponse(items);
  return response.body;
}

function itemsForSubtotal(subtotal) {
  return [{ sku: 'UNIT-001', quantity: subtotal }];
}

module.exports = { request, getHealth, getMissing, postEstimate, postEstimateResponse, itemsForSubtotal };
