import { create } from 'zustand';
import { User, AuthResponse } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  company_name?: string;
  industry?: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { token, refresh_token, ...userData } = response.data;
      
      api.setAuthTokens(token, refresh_token);
      
      set({
        user: userData as any,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { token, refresh_token, ...userData } = response.data;
      
      api.setAuthTokens(token, refresh_token);
      
      set({
        user: userData as any,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    api.clearAuthTokens();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<User>('/auth/me');
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
