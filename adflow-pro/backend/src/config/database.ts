// Database Configuration
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Initialize Supabase client
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

// Database connection pooling could be added here
export const db = {
  query: async (sql: string, params?: any[]) => {
    try {
      const { data, error } = await supabase.rpc('execute_query', {
        sql,
        params,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },
};

// Test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
};
