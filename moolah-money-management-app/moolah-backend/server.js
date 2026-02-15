// server.js (ESM + global authFirebase)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Global auth middleware (ESM)
import authFirebase from './middleware/authFirebase.js';

// Routers (ESM)
import budgetRoutes from './routes/budget.routes.js';
import categoryRoutes from './routes/category.routes.js';
import goalRoutes from './routes/goal.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// Core middleware
app.use(express.json());

// CORS: configure via .env or fall back to Vite default
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));

// API base
const API_BASE = '/api/v1';

// ✅ Apply Firebase Auth to all API v1 endpoints
app.use(API_BASE, authFirebase);

// Mount routes (all protected by authFirebase above)
app.use(`${API_BASE}/budgets`, budgetRoutes);
app.use(`${API_BASE}/categories`, categoryRoutes);
app.use(`${API_BASE}/goals`, goalRoutes);
app.use(`${API_BASE}/transactions`, transactionRoutes);
app.use(`${API_BASE}/user`, userRoutes);

// Public health check (left unauthenticated on purpose)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Central error handler (simple and safe)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`API listening on :${port}`));