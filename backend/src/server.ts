import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './db/database';

import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import incomeRoutes from './routes/income.routes';
import categoriesRoutes from './routes/categories.routes';
import analyticsRoutes from './routes/analytics.routes';
import groupsRoutes from './routes/groups.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/income-sources', incomeRoutes);
app.use('/api/income-categories', categoriesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start Server
async function start() {
  try {
    // Initialize Database
    await getDb();
    console.log('✅ SQLite Database initialized');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
