// Payment Model - Database queries
import { supabase } from '../config/database';
import { Payment } from '../../shared/types';

export const PaymentModel = {
  /**
   * Create payment
   */
  async create(paymentData: Partial<Payment>): Promise<Payment> {
    const { data, error } = await supabase.from('payments').insert([paymentData]).select().single();

    if (error) throw new Error(`Failed to create payment: ${error.message}`);
    return data;
  },

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select(
        `
        *,
        ad:ads(*),
        package:packages(*),
        user:users(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Failed to find payment: ${error.message}`);
    return data;
  },

  /**
   * Find payment by ad ID
   */
  async findByAdId(adId: string): Promise<Payment | null> {
    const { data, error } = await supabase.from('payments').select('*').eq('ad_id', adId).single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Failed to find payment: ${error.message}`);
    return data;
  },

  /**
   * Update payment
   */
  async update(id: string, paymentData: Partial<Payment>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update(paymentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update payment: ${error.message}`);
    return data;
  },

  /**
   * Get payment queue (unverified payments)
   */
  async getQueue(page: number = 1, limit: number = 20): Promise<{ payments: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('payment_queue_view')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch payment queue: ${error.message}`);
    return {
      payments: data || [],
      total: count || 0,
    };
  },

  /**
   * Get user payments
   */
  async findByUserId(userId: string, page: number = 1, limit: number = 20): Promise<{ payments: Payment[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('payments')
      .select(
        `
        *,
        ad:ads(title, slug),
        package:packages(name, price)
      `,
        { count: 'exact' },
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch user payments: ${error.message}`);
    return {
      payments: data || [],
      total: count || 0,
    };
  },

  /**
   * Get payments by status
   */
  async findByStatus(status: string, page: number = 1, limit: number = 20): Promise<{ payments: Payment[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
    return {
      payments: data || [],
      total: count || 0,
    };
  },

  /**
   * Get total revenue
   */
  async getTotalRevenue(): Promise<number> {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'verified');

    if (error) throw new Error(`Failed to calculate revenue: ${error.message}`);
    const total = (data || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
    return total;
  },
};
