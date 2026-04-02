// User Model - Database queries
import { supabase } from '../config/database';
import { User } from '../../shared/types';

export const UserModel = {
  /**
   * Create user
   */
  async create(userData: Partial<User> & { password_hash: string }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return this.formatUser(data);
  },

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Failed to find user: ${error.message}`);
    return this.formatUser(data);
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Failed to find user: ${error.message}`);
    return data;
  },

  /**
   * Update user
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return this.formatUser(data);
  },

  /**
   * Get all users (with pagination)
   */
  async getAll(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch users: ${error.message}`);
    return {
      users: (data || []).map((user) => this.formatUser(user)),
      total: count || 0,
    };
  },

  /**
   * Count users by role
   */
  async countByRole(role: string): Promise<number> {
    const { count, error } = await supabase.from('users').select('*', { count: 'exact' }).eq('role', role);

    if (error) throw new Error(`Failed to count users: ${error.message}`);
    return count || 0;
  },

  /**
   * Format user data (remove sensitive fields)
   */
  formatUser(data: any): User {
    const { password_hash, ...user } = data;
    return user;
  },
};
