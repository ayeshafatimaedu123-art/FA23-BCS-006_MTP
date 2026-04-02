/**
 * AdFlow Pro Backend Server
 * Production-ready Express + Supabase setup
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './src/config/database.js';
import { errorHandler, notFoundHandler } from './src/middlewares/error.handler.js';

// Routes
import authRoutes from './src/routes/auth.routes.js';
import clientRoutes from './src/routes/client.routes.js';
import moderatorRoutes from './src/routes/moderator.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import publicRoutes from './src/routes/public.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Security Middleware
 */
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Request Logging Middleware
 */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * API Routes
 * v1/api prefix
 */
const apiPrefix = '/api/v1';

// Auth routes
app.use(`${apiPrefix}/auth`, authRoutes);

// Client routes
app.use(`${apiPrefix}/client`, clientRoutes);

// Moderator routes
app.use(`${apiPrefix}/moderator`, moderatorRoutes);

// Admin routes
app.use(`${apiPrefix}/admin`, adminRoutes);

// Public routes
app.use(`${apiPrefix}`, publicRoutes);

/**
 * 404 Handler
 */
app.use('*', notFoundHandler);

/**
 * Error Handler (Must be last)
 */
app.use(errorHandler);

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected && process.env.NODE_ENV === 'production') {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api/v1`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Handle Unhandled Rejections
 */
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;
