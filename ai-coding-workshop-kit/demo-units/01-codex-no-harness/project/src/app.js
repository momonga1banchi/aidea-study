const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const taxRoutes = require('./routes/taxRoutes');

const app = express();

app.use(express.json());
app.use('/health', healthRoutes);
app.use('/tax', taxRoutes);

module.exports = app;
