// Main Server Entry Point
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';

import { env } from './config/env';
import { testConnection } from './config/database';
import { notFoundHandler, errorHandler } from './middleware/error.handler';

// Routes (will create these)
// import authRoutes from './routes/auth.routes';
// import adsRoutes from './routes/ads.routes';
// import paymentRoutes from './routes/payment.routes';
// import adminRoutes from './routes/admin.routes';
// import moderatorRoutes from './routes/moderator.routes';
// import publicRoutes from './routes/public.routes';

const app: Express = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AdFlow Pro API is running',
    timestamp: new Date().toISOString(),
  });
});

// API version
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    success: true,
    api: 'AdFlow Pro',
    version: '1.0.0',
    status: 'running',
  });
});

// Mount routes (uncomment once routes are created)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/ads', adsRoutes);
// app.use('/api/v1/payments', paymentRoutes);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/moderator', moderatorRoutes);
// app.use('/api/v1/public', publicRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected && env.isProduction) {
      console.error('Failed to connect to database. Exiting.');
      process.exit(1);
    }

    // Start listening
    app.listen(env.PORT, () => {
      console.log(`\n✓ Server running on port ${env.PORT}`);
      console.log(`✓ Environment: ${env.NODE_ENV}`);
      console.log(`✓ API URL: ${env.API_URL}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
startServer();

export default app;
