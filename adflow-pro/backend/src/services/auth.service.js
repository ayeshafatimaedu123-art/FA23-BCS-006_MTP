/**
 * Auth Service
 * Handles authentication business logic
 */

import supabase from '../config/database.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { 
  createConflictError, 
  createNotFoundError, 
  createUnauthorizedError,
  createValidationError 
} from '../utils/errors.js';
import { USER_STATUS } from '../config/constants.js';

/**
 * Register new user
 */
export const registerUser = async (data) => {
  // Validate password strength
  const passwordValidation = validatePasswordStrength(data.password);
  if (!passwordValidation.isValid) {
    throw createValidationError(passwordValidation.errors.join(', '));
  }
  
  // Check if email already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', data.email)
    .single();
  
  if (existingUser) {
    throw createConflictError('Email already registered');
  }
  
  // Hash password
  const hashedPassword = await hashPassword(data.password);
  
  // Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert([{
      email: data.email,
      password_hash: hashedPassword,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone || null,
      role: data.role || 'client',
      status: USER_STATUS.ACTIVE
    }])
    .select()
    .single();
  
  if (error) {
    throw createUnauthorizedError('Failed to create user');
  }
  
  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);
  
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    },
    accessToken,
    refreshToken
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error || !user) {
    throw createUnauthorizedError('Invalid email or password');
  }
  
  // Compare password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw createUnauthorizedError('Invalid email or password');
  }
  
  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);
  
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    },
    accessToken,
    refreshToken
  };
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !user) {
    throw createNotFoundError('User');
  }
  
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.created_at
  };
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, data) => {
  const { data: user, error } = await supabase
    .from('users')
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      bio: data.bio
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    throw createNotFoundError('User');
  }
  
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    bio: user.bio
  };
};
