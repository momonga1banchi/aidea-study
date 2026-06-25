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
  startServer()
    .then(server => {
      const address = server.address();
      const host = typeof address === 'object' && address ? address.address : process.env.HOST || '127.0.0.1';
      const port = typeof address === 'object' && address ? address.port : process.env.PORT || 3000;
      process.stdout.write(`Server listening on http://${host}:${port}\n`);
    })
    .catch(error => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = { startServer };
