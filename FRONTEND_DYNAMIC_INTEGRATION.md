# 🔄 Frontend Dynamic Integration Guide

Transform your static frontend into a fully dynamic application connected to the backend API and ML model.

---

## 📋 Current State vs Target State

### Current (Static)
- ❌ Hardcoded data in components
- ❌ No API calls
- ❌ No real-time updates
- ❌ No ML predictions

### Target (Dynamic)
- ✅ Data from backend API
- ✅ Real-time updates
- ✅ ML-powered predictions
- ✅ User authentication
- ✅ Interactive charts with live data

---

## 🎯 Integration Steps

### Step 1: Create API Service Layer
### Step 2: Connect Authentication
### Step 3: Fetch Real Data for Dashboard
### Step 4: Integrate ML Predictions
### Step 5: Add Real-time Updates
### Step 6: Make Charts Dynamic

---

## Step 1: Create API Service Layer

### Create `frontend/src/lib/api.ts`

```typescript
// API configuration and service layer
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8001';

// Types
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

export interface MLPrediction {
  predicted_price: number;
  confidence: string;
}

// API Client
class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string, full_name: string) {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
  }

  async getCurrentUser() {
    return this.request('/api/v1/auth/me');
  }

  // Commodities
  async getCommodities(): Promise<Commodity[]> {
    return this.request('/api/v1/commodities');
  }

  async getCommodity(id: number): Promise<Commodity> {
    return this.request(`/api/v1/commodities/${id}`);
  }

  async getCommodityPrices(
    commodityId: number,
    limit: number = 100
  ): Promise<PriceHistory[]> {
    return this.request(`/api/v1/commodities/${commodityId}/prices?limit=${limit}`);
  }

  // Sentiment
  async getSentiment(limit: number = 100): Promise<SentimentData[]> {
    return this.request(`/api/v1/sentiment?limit=${limit}`);
  }

  async getCommoditySentiment(commodityId: number): Promise<SentimentData[]> {
    return this.request(`/api/v1/sentiment/commodity/${commodityId}`);
  }

  // Forecasts
  async getForecasts(limit: number = 100): Promise<Forecast[]> {
    return this.request(`/api/v1/forecasts?limit=${limit}`);
  }

  async getCommodityForecasts(commodityId: number): Promise<Forecast[]> {
    return this.request(`/api/v1/forecasts/commodity/${commodityId}`);
  }

  // ML Predictions
  async predictPrice(features: Record<string, number>): Promise<MLPrediction> {
    const response = await fetch(`${ML_API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features }),
    });

    if (!response.ok) throw new Error('Prediction failed');
    return response.json();
  }

  // Dashboard Stats
  async getDashboardStats() {
    const [commodities, sentiment, forecasts] = await Promise.all([
      this.getCommodities(),
      this.getSentiment(10),
      this.getForecasts(10),
    ]);

    return {
      totalCommodities: commodities.length,
      avgSentiment: sentiment.reduce((acc, s) => acc + s.sentiment_score, 0) / sentiment.length,
      totalForecasts: forecasts.length,
      recentActivity: sentiment.length + forecasts.length,
    };
  }
}

export const api = new APIClient();
```

### Create `frontend/src/lib/hooks/useAPI.ts`

```typescript
// React hooks for API calls
import { useEffect, useState } from 'react';
import { api } from '../api';

export function useCommodities() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api.getCommodities()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useCommodityPrices(commodityId: number) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!commodityId) return;
    
    api.getCommodityPrices(commodityId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [commodityId]);

  return { data, loading, error, refetch: () => {
    setLoading(true);
    api.getCommodityPrices(commodityId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }};
}

export function useSentiment() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api.getSentiment()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useDashboardStats() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api.getDashboardStats()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

---

## Step 2: Connect Authentication

### Update `frontend/src/app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## Step 3: Make Dashboard Dynamic

### Update `frontend/src/app/(dashboard)/dashboard/page.tsx`

```typescript
'use client';

import { useDashboardStats, useCommodities, useSentiment } from '@/lib/hooks/useAPI';
import KPICard from '@/app/components/KPICard';
import SentimentIndicator from '@/app/components/SentimentIndicator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { data: commodities, loading: commoditiesLoading } = useCommodities();
  const { data: sentiment, loading: sentimentLoading } = useSentiment();

  if (statsLoading || commoditiesLoading || sentimentLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate average sentiment
  const avgSentiment = sentiment.length > 0
    ? sentiment.reduce((acc, s) => acc + s.sentiment_score, 0) / sentiment.length
    : 0;

  // Prepare chart data from real sentiment
  const chartData = sentiment.slice(0, 10).map(s => ({
    date: new Date(s.published_at).toLocaleDateString(),
    sentiment: s.sentiment_score,
    commodity: s.commodity_id,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Commodities"
          value={stats?.totalCommodities || 0}
          change={5.2}
          trend="up"
        />
        <KPICard
          title="Avg Sentiment"
          value={avgSentiment.toFixed(2)}
          change={2.1}
          trend="up"
        />
        <KPICard
          title="Active Forecasts"
          value={stats?.totalForecasts || 0}
          change={-1.3}
          trend="down"
        />
        <KPICard
          title="Recent Activity"
          value={stats?.recentActivity || 0}
          change={8.7}
          trend="up"
        />
      </div>

      {/* Sentiment Indicator */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Market Sentiment</h2>
        <SentimentIndicator score={avgSentiment} />
      </div>

      {/* Sentiment Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Sentiment Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sentiment" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Commodities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Commodities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commodities.slice(0, 6).map((commodity) => (
            <div key={commodity.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <h3 className="font-semibold">{commodity.name}</h3>
              <p className="text-sm text-gray-600">{commodity.category}</p>
              <p className="text-xs text-gray-500 mt-2">Unit: {commodity.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 4: Integrate ML Predictions

### Create `frontend/src/app/(dashboard)/predictions/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useCommodities } from '@/lib/hooks/useAPI';

export default function PredictionsPage() {
  const { data: commodities } = useCommodities();
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [features, setFeatures] = useState({
    price_lag_1: 0,
    price_lag_7: 0,
    price_rolling_mean_7: 0,
    avg_sentiment: 0,
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const result = await api.predictPrice(features);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Price Predictions</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">ML Model Prediction</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Commodity</label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select commodity</option>
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (1 day ago)</label>
            <input
              type="number"
              value={features.price_lag_1}
              onChange={(e) => setFeatures({ ...features, price_lag_1: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (7 days ago)</label>
            <input
              type="number"
              value={features.price_lag_7}
              onChange={(e) => setFeatures({ ...features, price_lag_7: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">7-day Average</label>
            <input
              type="number"
              value={features.price_rolling_mean_7}
              onChange={(e) => setFeatures({ ...features, price_rolling_mean_7: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sentiment Score</label>
            <input
              type="number"
              step="0.1"
              min="-1"
              max="1"
              value={features.avg_sentiment}
              onChange={(e) => setFeatures({ ...features, avg_sentiment: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Predicting...' : 'Predict Price'}
        </button>

        {prediction && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Prediction Result</h3>
            <p className="text-2xl font-bold text-blue-600">
              ₹{prediction.predicted_price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Confidence: {prediction.confidence}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Step 5: Add Real-time Updates

### Create `frontend/src/lib/hooks/useRealtime.ts`

```typescript
import { useEffect, useState } from 'react';
import { api } from '../api';

export function useRealtime<T>(
  fetchFunction: () => Promise<T>,
  interval: number = 30000 // 30 seconds
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchFunction();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return { data, loading, error };
}

// Usage example
export function useRealtimeSentiment() {
  return useRealtime(() => api.getSentiment(10), 30000);
}
```

---

## Step 6: Environment Configuration

### Create `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ML_API_URL=http://localhost:8001
```

### Update `frontend/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    ML_API_URL: process.env.NEXT_PUBLIC_ML_API_URL,
  },
};

module.exports = nextConfig;
```

---

## 🚀 Testing the Integration

### 1. Start Backend
```bash
cd backend
RUN_BACKEND.bat
# Backend at http://localhost:8000
```

### 2. Start ML API
```bash
cd backend
python serve_model.py
# ML API at http://localhost:8001
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# Frontend at http://localhost:3000
```

### 4. Test Flow
1. Go to http://localhost:3000/login
2. Login with credentials
3. View dynamic dashboard with real data
4. Test ML predictions
5. See real-time updates

---

## 📊 Complete Integration Checklist

- [ ] Create API service layer (`lib/api.ts`)
- [ ] Create React hooks (`lib/hooks/useAPI.ts`)
- [ ] Update login page with API
- [ ] Make dashboard dynamic
- [ ] Add predictions page
- [ ] Add real-time updates
- [ ] Configure environment variables
- [ ] Test all features
- [ ] Add error handling
- [ ] Add loading states

---

## 🎯 Next Steps

1. **Start with API layer** - Create the service files
2. **Update one page at a time** - Start with dashboard
3. **Test incrementally** - Test each feature as you add it
4. **Add error handling** - Handle API failures gracefully
5. **Optimize performance** - Add caching and pagination

---

**Ready to make your frontend dynamic!** Start with Step 1 and work through each step. 🚀
