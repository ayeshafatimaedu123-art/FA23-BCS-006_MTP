/**
 * useAuth Hook
 * Manages authentication state
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../api/client';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
    
    setLoading(false);
  }, []);

  const register = useCallback(async (data) => {
    try {
      setError(null);
      const response = await authAPI.register(data);
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUser(response.data.user);
      router.push('/dashboard');
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [router]);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUser(response.data.user);
      router.push('/dashboard');
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  }, [router]);

  const updateProfile = useCallback(async (data) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(data);
      const updated = { ...user, ...response.data };
      
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile
  };
};
