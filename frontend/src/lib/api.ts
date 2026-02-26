import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      config => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      async (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed && error.config) {
            return this.client.request(error.config);
          }
          // Redirect to login
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refresh_token: refreshToken,
      });

      const { token, refresh_token } = response.data.data;
      this.setToken(token);
      this.setRefreshToken(refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Auth methods
  setAuthTokens(token: string, refreshToken: string): void {
    this.setToken(token);
    this.setRefreshToken(refreshToken);
  }

  clearAuthTokens(): void {
    this.clearAuth();
  }
}

export const api = new ApiClient();
export default api;
