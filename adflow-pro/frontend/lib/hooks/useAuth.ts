// Frontend - Auth Hook
'use client';

import { useState, useCallback, useEffect } from 'react';
import axios, { AxiosInstance } from 'axios';
import { User } from '@/shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { user, token, refreshToken } = response.data.data;

      setUser(user);
      setToken(token);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (data: any) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);

      const { user, token, refreshToken } = response.data.data;

      setUser(user);
      setToken(token);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }, []);

  const updateProfile = useCallback(async (data: any) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  }, [token]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateProfile,
  };
};
