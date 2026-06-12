// @ts-check
const http = require('node:http');
const { createApp } = require('./app');

function startServer(port = Number(process.env.PORT || 3000), host = process.env.HOST || '127.0.0.1') {
  const server = http.createServer(createApp());
  return new Promise(resolve => {
    server.listen(port, host, () => resolve(server));
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
