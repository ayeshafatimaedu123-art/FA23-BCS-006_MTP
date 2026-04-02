/**
 * Payment Service
 * Handles payment business logic
 */

import supabase from '../config/database.js';
import { createNotFoundError } from '../utils/errors.js';
import { PAYMENT_STATUS, AD_STATUS } from '../config/constants.js';

/**
 * Create payment
 */
export const createPayment = async (userId, data) => {
  const { data: payment, error } = await supabase
    .from('payments')
    .insert([{
      ad_id: data.adId,
      user_id: userId,
      amount: data.amount,
      payment_method: data.paymentMethod,
      transaction_id: data.transactionId,
      status: PAYMENT_STATUS.SUBMITTED,
      notes: data.notes
    }])
    .select()
    .single();
  
  if (error) {
    throw new Error('Failed to create payment');
  }
  
  return payment;
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId) => {
  const { data: payment, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();
  
  if (error || !payment) {
    throw createNotFoundError('Payment');
  }
  
  return payment;
};

/**
 * Get payment queue (for admin verification)
 */
export const getPaymentQueue = async (filters) => {
  let query = supabase
    .from('payments')
    .select(`
      *,
      ad:ads(id, title, slug),
      user:users(id, email, first_name, last_name)
    `, { count: 'exact' })
    .eq('status', PAYMENT_STATUS.SUBMITTED);
  
  // Pagination
  const from = (filters.page - 1) * filters.limit;
  query = query.range(from, from + filters.limit - 1)
    .order('created_at', { ascending: true });
  
  const { data: payments, error, count } = await query;
  
  if (error) {
    throw new Error('Failed to fetch payment queue');
  }
  
  return {
    payments: payments || [],
    total: count || 0,
    page: filters.page,
    limit: filters.limit
  };
};

/**
 * Verify payment
 */
export const verifyPayment = async (paymentId, status, comment) => {
  const payment = await getPaymentById(paymentId);
  
  // Update payment status
  const { data: updated, error } = await supabase
    .from('payments')
    .update({
      status: status === 'verified' ? PAYMENT_STATUS.VERIFIED : PAYMENT_STATUS.REJECTED,
      verification_comment: comment,
      verified_at: new Date().toISOString()
    })
    .eq('id', paymentId)
    .select()
    .single();
  
  if (error) {
    throw new Error('Failed to verify payment');
  }
  
  // If verified, update ad status to VERIFIED
  if (status === 'verified') {
    await supabase
      .from('ads')
      .update({ status: AD_STATUS.VERIFIED })
      .eq('id', payment.ad_id);
  }
  
  return updated;
};

/**
 * Get user's payments
 */
export const getUserPayments = async (userId, filters) => {
  let query = supabase
    .from('payments')
    .select(`
      *,
      ad:ads(id, title, slug)
    `, { count: 'exact' })
    .eq('user_id', userId);
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  // Pagination
  const from = (filters.page - 1) * filters.limit;
  query = query.range(from, from + filters.limit - 1)
    .order('created_at', { ascending: false });
  
  const { data: payments, error, count } = await query;
  
  if (error) {
    throw new Error('Failed to fetch payments');
  }
  
  return {
    payments: payments || [],
    total: count || 0,
    page: filters.page,
    limit: filters.limit
  };
};
