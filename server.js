require('dotenv').config();
const express = require('express');
const axios = require('axios');
const admin = require('./firebase/admin');
const app = express();

app.use(express.json());

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173' })); // NEEDS TO MATCH FRONTEND PORT


// Routes
app.use('/api/v1/transactions', require('./routes/transaction.routes'));
app.use('/api/v1/budgets', require('./routes/budget.routes'));
app.use('/api/v1/goals', require('./routes/goal.routes'));
app.use('/api/v1/categories', require('./routes/category.routes'));
app.use('/api/v1/user', require('./routes/user.routes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Minimal terminal error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on :${port}`));