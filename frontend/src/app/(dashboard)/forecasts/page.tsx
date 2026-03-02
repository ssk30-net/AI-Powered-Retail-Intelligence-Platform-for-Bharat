'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import api from '@/lib/api';

interface Commodity {
  id: number;
  name: string;
  category?: string;
  unit?: string;
}

interface ForecastPoint {
  date: string;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}

interface ForecastData {
  commodity_id: number;
  commodity_name: string;
  historical: Array<{ date: string; price: number }>;
  forecast: ForecastPoint[];
  explanation: string;
  accuracy: number;
}

export default function ForecastsPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loadingCommodities, setLoadingCommodities] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCommodities(true);
        const res = await api.get<{ commodities: Commodity[] }>('/forecasts/commodities');
        if (!cancelled && res.data?.commodities?.length) {
          setCommodities(res.data.commodities);
          if (res.data.commodities[0]) setSelectedId(res.data.commodities[0].id);
        } else {
          setCommodities([]);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load commodities');
        setCommodities([]);
      } finally {
        if (!cancelled) setLoadingCommodities(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (selectedId == null) {
      setForecastData(null);
      return;
    }
    let cancelled = false;
    setLoadingForecast(true);
    setError(null);
    (async () => {
      try {
        const res = await api.get<ForecastData>(`/forecasts/${selectedId}?horizon=30`);
        if (!cancelled && res.data) setForecastData(res.data);
        else if (!cancelled) setForecastData(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load forecast');
          setForecastData(null);
        }
      } finally {
        if (!cancelled) setLoadingForecast(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId]);

  const chartData = (() => {
    if (!forecastData) return [];
    const hist = (forecastData.historical || []).map((h) => ({
      date: h.date,
      actual: h.price,
      forecast: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
    }));
    const fcast = (forecastData.forecast || []).map((f) => ({
      date: f.date,
      actual: null as number | null,
      forecast: f.predicted_price,
      lower: f.lower_bound,
      upper: f.upper_bound,
    }));
    const byDate: Record<string, { date: string; actual: number | null; forecast: number | null; lower: number | null; upper: number | null }> = {};
    hist.forEach((h) => { byDate[h.date] = { ...h }; });
    fcast.forEach((f) => {
      if (byDate[f.date]) {
        byDate[f.date].forecast = f.forecast;
        byDate[f.date].lower = f.lower;
        byDate[f.date].upper = f.upper;
      } else {
        byDate[f.date] = { date: f.date, actual: null, forecast: f.forecast, lower: f.lower, upper: f.upper };
      }
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  })();

  const firstForecast = forecastData?.forecast?.[0];
  const lastForecast = forecastData?.forecast?.length
    ? forecastData.forecast[forecastData.forecast.length - 1]
    : null;
  const avgConfidence = forecastData?.forecast?.length
    ? forecastData.forecast.reduce((a, f) => a + f.confidence, 0) / forecastData.forecast.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Price Forecasts</h1>
        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            {error}
          </div>
        )}

        {loadingCommodities ? (
          <p className="text-gray-600">Loading commodities from RDS...</p>
        ) : commodities.length === 0 ? (
          <p className="text-gray-600">No commodities in RDS. Add commodities to see forecasts.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {commodities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedId === c.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="text-lg font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.category || '—'}</div>
                </button>
              ))}
            </div>

            {loadingForecast ? (
              <p className="text-gray-600">Loading forecast from RDS...</p>
            ) : forecastData ? (
              <>
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {forecastData.commodity_name} – Historical & model forecast (RDS)
                  </h2>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <ReferenceLine x={chartData.filter((d) => d.actual != null).pop()?.date} stroke="#94a3b8" strokeDasharray="2 2" />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          name="Actual (RDS)"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="forecast"
                          name="Forecast (model)"
                          stroke="#9333ea"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3 }}
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="lower"
                          name="Lower bound"
                          stroke="#64748b"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="upper"
                          name="Upper bound"
                          stroke="#64748b"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                      No historical or forecast data in RDS for this commodity.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <Calendar className="w-6 h-6 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold">Next period</h3>
                    </div>
                    <div className="text-3xl font-bold">
                      {firstForecast != null
                        ? `₹${firstForecast.predicted_price.toLocaleString()}`
                        : '—'}
                    </div>
                    <div className="text-gray-600 mt-2">
                      {firstForecast != null && firstForecast.lower_bound != null && firstForecast.upper_bound != null
                        ? `Range: ₹${firstForecast.lower_bound.toLocaleString()} – ₹${firstForecast.upper_bound.toLocaleString()}`
                        : 'Model output from RDS'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold">End of horizon</h3>
                    </div>
                    <div className="text-3xl font-bold">
                      {lastForecast != null
                        ? `₹${lastForecast.predicted_price.toLocaleString()}`
                        : '—'}
                    </div>
                    <div className="text-gray-600 mt-2">
                      {lastForecast != null ? `Confidence: ${(lastForecast.confidence * 100).toFixed(0)}%` : '—'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold">Model accuracy</h3>
                    </div>
                    <div className="text-3xl font-bold">{forecastData.accuracy ?? 0}%</div>
                    <div className="text-gray-600 mt-2">From RDS forecast data</div>
                  </div>
                </div>

                {forecastData.explanation && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Explanation</h3>
                    <p className="text-gray-600">{forecastData.explanation}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-600">Select a commodity to load forecast from RDS.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
