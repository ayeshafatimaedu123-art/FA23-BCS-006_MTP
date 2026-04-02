// Auth Controller
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { LoginInput, RegisterInput } from '../validators/auth.validator';
import { UserModel } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { ConflictError, UnauthorizedError, ServerError, ValidationError } from '../utils/error.utils';
import { CONSTANTS } from '../config/constants';

export const authController = {
  /**
   * Register user
   */
  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, phone, companyName }: RegisterInput = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw ConflictError(CONSTANTS.ERROR_MESSAGES.DUPLICATE_EMAIL);
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await UserModel.create({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role: role as 'client' | 'moderator',
        phone,
        company_name: companyName,
        status: 'active',
      });

      // Generate tokens
      const token = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.USER_CREATED,
        data: {
          user,
          token,
          refreshToken,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   */
  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password }: LoginInput = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw UnauthorizedError(CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw UnauthorizedError(CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Check if user is active
      if (user.status === 'suspended' || user.status === 'inactive') {
        throw UnauthorizedError('Your account is not active');
      }

      // Update last login
      await UserModel.update(user.id, {
        last_login: new Date(),
      });

      // Generate tokens
      const token = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const userWithoutPassword = { ...user };
      delete (userWithoutPassword as any).password_hash;

      res.json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refresh token
   */
  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw ValidationError('Refresh token is required');
      }

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        throw UnauthorizedError(CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN);
      }

      // Get fresh user data
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        throw UnauthorizedError('User not found');
      }

      // Generate new tokens
      const newToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw UnauthorizedError();
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        throw UnauthorizedError('User not found');
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw UnauthorizedError();
      }

      const { firstName, lastName, phone, companyName, companyWebsite, bio, profileImageUrl } = req.body;

      const updatedUser = await UserModel.update(req.user.id, {
        first_name: firstName,
        last_name: lastName,
        phone,
        company_name: companyName,
        company_website: companyWebsite,
        bio,
        profile_image_url: profileImageUrl,
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout (client-side, just returns success)
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  },
};
