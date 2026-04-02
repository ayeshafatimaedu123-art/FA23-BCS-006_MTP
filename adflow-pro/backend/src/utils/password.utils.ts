// Password Utility Functions
import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcryptjs.genSalt(SALT_ROUNDS);
    return await bcryptjs.hash(password, salt);
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcryptjs.compare(password, hash);
  } catch (error) {
    throw new Error('Error comparing password');
  }
};

/**
 * Validate password strength
 * Requires: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const validatePasswordStrength = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
