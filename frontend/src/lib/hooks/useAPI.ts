/**
 * React hooks for API data fetching
 * Provides easy-to-use hooks for components to fetch data from backend
 */
import { useEffect, useState, useCallback } from 'react';
import {
  commoditiesAPI,
  sentimentAPI,
  forecastsAPI,
  regionsAPI,
  dashboardAPI,
  mlAPI,
  type Commodity,
  type PriceHistory,
  type SentimentData,
  type Forecast,
  type Region,
  type DashboardStats,
  type MLPrediction,
} from '../api';

// Generic hook state interface
interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Generic API hook
function useAPIData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
): UseAPIState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Commodities hooks
export function useCommodities() {
  return useAPIData<Commodity[]>(commoditiesAPI.getAll);
}

export function useCommodity(id: number) {
  return useAPIData<Commodity>(
    () => commoditiesAPI.getById(id),
    [id]
  );
}

export function useCommodityPrices(commodityId: number, limit: number = 100) {
  return useAPIData<PriceHistory[]>(
    () => commoditiesAPI.getPrices(commodityId, limit),
    [commodityId, limit]
  );
}

// Sentiment hooks
export function useSentiment(limit: number = 100) {
  return useAPIData<SentimentData[]>(
    () => sentimentAPI.getAll(limit),
    [limit]
  );
}

export function useCommoditySentiment(commodityId: number) {
  return useAPIData<SentimentData[]>(
    () => sentimentAPI.getByCommodity(commodityId),
    [commodityId]
  );
}

// Forecasts hooks
export function useForecasts(limit: number = 100) {
  return useAPIData<Forecast[]>(
    () => forecastsAPI.getAll(limit),
    [limit]
  );
}

export function useCommodityForecasts(commodityId: number) {
  return useAPIData<Forecast[]>(
    () => forecastsAPI.getByCommodity(commodityId),
    [commodityId]
  );
}

// Regions hook
export function useRegions() {
  return useAPIData<Region[]>(regionsAPI.getAll);
}

// Dashboard hook
export function useDashboardStats() {
  return useAPIData<DashboardStats>(dashboardAPI.getStats);
}

// ML API hooks
export function useMLFeatures() {
  return useAPIData<string[]>(mlAPI.getFeatures);
}

export function useMLHealth() {
  return useAPIData<any>(mlAPI.getHealth);
}

export function useMLMetrics() {
  return useAPIData<any>(mlAPI.getMetrics);
}

// ML Prediction hook (manual trigger)
export function useMLPrediction() {
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const predict = useCallback(async (features: Record<string, number>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mlAPI.predict(features);
      setPrediction(result);
      return result;
    } catch (err) {
      setError(err as Error);
      console.error('Prediction Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { prediction, loading, error, predict };
}

// Real-time data hook (auto-refresh)
export function useRealtime<T>(
  fetchFunction: () => Promise<T>,
  interval: number = 30000 // 30 seconds default
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
        console.error('Realtime fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval for auto-refresh
    const intervalId = setInterval(fetchData, interval);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [interval]);

  return { data, loading, error };
}

// Convenience hooks for real-time data
export function useRealtimeSentiment(interval: number = 30000) {
  return useRealtime(() => sentimentAPI.getAll(10), interval);
}

export function useRealtimeForecasts(interval: number = 30000) {
  return useRealtime(() => forecastsAPI.getAll(10), interval);
}

export function useRealtimeDashboard(interval: number = 30000) {
  return useRealtime(dashboardAPI.getStats, interval);
}
