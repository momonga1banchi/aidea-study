// @ts-check
const { handleHealth } = require('./controllers/healthController');
const { handleOrderEstimate } = require('./controllers/orderController');

function createApp() {
  return async function app(req, res) {
    try {
      if (req.method === 'GET' && req.url === '/health') return send(res, await handleHealth());
      if (req.method === 'POST' && req.url === '/orders/estimate') {
        const payload = await readJson(req);
        return send(res, await handleOrderEstimate(payload));
      }
      return send(res, { status: 404, body: { error: 'not found' } });
    } catch (error) {
      return send(res, { status: 500, body: { error: error.message || 'internal server error' } });
    }
  };
}

function send(res, result) {
  res.statusCode = result.status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(result.body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('error', reject);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); }
    });
  });
}

module.exports = { createApp };
