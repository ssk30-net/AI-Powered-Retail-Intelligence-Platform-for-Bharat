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

    // Request interceptor to add auth token; allow FormData to set its own Content-Type
    this.client.interceptors.request.use(
      config => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
          delete (config.headers as Record<string, unknown>)['Content-Type'];
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

// ============================================================================
// EXTENDED API METHODS FOR AI MARKET PULSE
// ============================================================================

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8001';

// Types for API responses
export interface Commodity {
  id: number;
  name: string;
  category: string;
  unit: string;
  description?: string;
}

export interface PriceHistory {
  id: number;
  commodity_id: number;
  region_id: number;
  price: number;
  volume?: number;
  recorded_at: string;
  source: string;
}

export interface SentimentData {
  id: number;
  commodity_id: number;
  headline: string;
  sentiment_score: number;
  sentiment_label: string;
  published_at: string;
  source: string;
}

export interface Forecast {
  id: number;
  commodity_id: number;
  region_id: number;
  forecast_date: string;
  predicted_price: number;
  confidence_score: number;
  model_version: string;
}

export interface Region {
  id: number;
  name: string;
  state: string;
  type: string;
}

export interface MLPrediction {
  predicted_price: number;
  confidence: string;
  model_version: string;
  features_used: number;
}

export interface DashboardStats {
  totalCommodities: number;
  avgSentiment: number;
  totalForecasts: number;
  recentActivity: number;
}

// Authentication API
export const authAPI = {
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    
    // Store token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
    }
    
    return data;
  },

  async register(email: string, password: string, full_name: string) {
    return api.post('/auth/register', { email, password, full_name });
  },

  async getCurrentUser() {
    return api.get('/auth/me');
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
  }
};

// Commodities API
export const commoditiesAPI = {
  async getAll(): Promise<Commodity[]> {
    const response = await api.get<Commodity[]>('/commodities');
    return response.data || [];
  },

  async getById(id: number): Promise<Commodity> {
    const response = await api.get<Commodity>(`/commodities/${id}`);
    return response.data;
  },

  async getPrices(commodityId: number, limit: number = 100): Promise<PriceHistory[]> {
    const response = await api.get<PriceHistory[]>(`/commodities/${commodityId}/prices?limit=${limit}`);
    return response.data || [];
  },
};

// Sentiment API
export const sentimentAPI = {
  async getAll(limit: number = 100): Promise<SentimentData[]> {
    const response = await api.get<SentimentData[]>(`/sentiment?limit=${limit}`);
    return response.data || [];
  },

  async getByCommodity(commodityId: number): Promise<SentimentData[]> {
    const response = await api.get<SentimentData[]>(`/sentiment/commodity/${commodityId}`);
    return response.data || [];
  },
};

// Forecasts API
export const forecastsAPI = {
  async getAll(limit: number = 100): Promise<Forecast[]> {
    const response = await api.get<Forecast[]>(`/forecasts?limit=${limit}`);
    return response.data || [];
  },

  async getByCommodity(commodityId: number): Promise<Forecast[]> {
    const response = await api.get<Forecast[]>(`/forecasts/commodity/${commodityId}`);
    return response.data || [];
  },
};

// Regions API
export const regionsAPI = {
  async getAll(): Promise<Region[]> {
    const response = await api.get<Region[]>('/regions');
    return response.data || [];
  },
};

// ML Predictions API (Local Model)
export const mlAPI = {
  async predict(features: Record<string, number>): Promise<MLPrediction> {
    const response = await fetch(`${ML_API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features }),
    });

    if (!response.ok) throw new Error('Prediction failed');
    return response.json();
  },

  async getFeatures(): Promise<string[]> {
    const response = await fetch(`${ML_API_URL}/features`);
    if (!response.ok) throw new Error('Failed to fetch features');
    const data = await response.json();
    return data.features || [];
  },

  async getHealth() {
    const response = await fetch(`${ML_API_URL}/health`);
    if (!response.ok) throw new Error('ML API health check failed');
    return response.json();
  },

  async getMetrics() {
    const response = await fetch(`${ML_API_URL}/metrics`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  },
};

// Dashboard API
export const dashboardAPI = {
  async getStats(): Promise<DashboardStats> {
    try {
      const [commodities, sentiment, forecasts] = await Promise.all([
        commoditiesAPI.getAll(),
        sentimentAPI.getAll(10),
        forecastsAPI.getAll(10),
      ]);

      const avgSentiment = sentiment.length > 0
        ? sentiment.reduce((acc, s) => acc + s.sentiment_score, 0) / sentiment.length
        : 0;

      return {
        totalCommodities: commodities.length,
        avgSentiment,
        totalForecasts: forecasts.length,
        recentActivity: sentiment.length + forecasts.length,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return {
        totalCommodities: 0,
        avgSentiment: 0,
        totalForecasts: 0,
        recentActivity: 0,
      };
    }
  },
};

// Copilot API
export const copilotAPI = {
  async chat(message: string, userId?: string): Promise<{
    response: string;
    confidence: number;
    timestamp: string;
  }> {
    try {
      const response = await api.post<{
        response: string;
        confidence: number;
        timestamp: string;
      }>('/copilot/chat', {
        message,
        user_id: userId || 'anonymous',
      });
      return response.data;
    } catch (error) {
      console.error('Copilot API error:', error);
      throw error;
    }
  },
};

// Data ingest / upload API
export const dataIngestAPI = {
  async uploadFile(file: File): Promise<{ rows_accepted: number; rows_rejected: number; errors?: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ rows_accepted: number; rows_rejected: number; errors?: string[] }>(
      '/data/upload',
      formData,
      { timeout: 120000, headers: {} }
    );
    return response.data!;
  },

  async skipOnboarding(): Promise<void> {
    await api.post('/auth/skip-onboarding', {});
  },
};

// Insights API
export const insightsAPI = {
  async getInsights(commodities?: string[]): Promise<{
    opportunities: Array<{title: string; description: string; impact: string; commodity: string}>;
    risks: Array<{title: string; description: string; severity: string; commodity: string}>;
    recommendations: Array<{action: string; commodity: string; confidence: number; reasoning: string}>;
  }> {
    try {
      const response = await api.post<{
        opportunities: Array<{title: string; description: string; impact: string; commodity: string}>;
        risks: Array<{title: string; description: string; severity: string; commodity: string}>;
        recommendations: Array<{action: string; commodity: string; confidence: number; reasoning: string}>;
      }>('/insights/generate', {
        commodities: commodities || [],
      });
      return response.data;
    } catch (error) {
      console.error('Insights API error:', error);
      throw error;
    }
  },

  async getCommoditySentiment(commodity: string): Promise<{
    overall_sentiment: string;
    sentiment_score: number;
    article_count: number;
    articles: Array<{headline: string; sentiment: string; source: string; published_at: string}>;
  }> {
    try {
      const response = await api.get<{
        overall_sentiment: string;
        sentiment_score: number;
        article_count: number;
        articles: Array<{headline: string; sentiment: string; source: string; published_at: string}>;
      }>(`/sentiment/commodity/${commodity}`);
      return response.data;
    } catch (error) {
      console.error('Sentiment API error:', error);
      throw error;
    }
  },
};
