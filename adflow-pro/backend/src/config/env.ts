// Backend Configuration - Environment Variables
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000'),
  API_URL: process.env.API_URL || 'http://localhost:5000',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret',
  REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE || '30d',

  // Email
  MAIL_SERVICE: process.env.MAIL_SERVICE || 'gmail',
  MAIL_EMAIL: process.env.MAIL_EMAIL || '',
  MAIL_PASSWORD: process.env.MAIL_PASSWORD || '',
  MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || 'AdFlow Pro',

  // APIs
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
  CRON_SECRET: process.env.CRON_SECRET || '',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@adflow.pro',

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate required env vars
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_KEY'];
const missing = requiredVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}
