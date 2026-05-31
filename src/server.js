const express = require('express');
const { rateLimiterMiddleware} = require('./middleware/rateLimiter');
const apiRoutes = require('./routes/api');
const homeRoute = require('./routes/home');

const app = express();

app.use('/', homeRoute);
app.use('/api', rateLimiterMiddleware, apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

module.exports = app;
