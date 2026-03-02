'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Calendar, DollarSign, ChevronDown, Search } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/app/components/ui/command';
import { cn } from '@/lib/utils';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedCommodity = useMemo(
    () => commodities.find((c) => c.id === selectedId),
    [commodities, selectedId]
  );

  useEffect(() => {
    const cached = sessionStorage.getItem('forecast-commodity-list');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Commodity[];
        if (parsed.length > 0) {
          setCommodities(parsed);
          setSelectedId((prev) => prev ?? parsed[0].id);
          setLoadingCommodities(false);
        }
      } catch {
        // Ignore invalid cache and fetch from API.
      }
    }

    let cancelled = false;
    (async () => {
      try {
        setLoadingCommodities(true);
        interface DataAvailability {
          with_price_history: Array<{ commodity_id: number; name: string; price_history_count: number | null }>;
          with_forecasts: Array<{ commodity_id: number; name: string; forecast_count: number | null }>;
        }
        const res = await api.get<DataAvailability>('/forecasts/data-availability');
        const payload = res && 'data' in res ? (res as { data?: DataAvailability }).data : undefined;
        const withFc = payload?.with_forecasts ?? [];
        const list = withFc
          .map((x) => ({ id: x.commodity_id, name: x.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        if (!cancelled) {
          setCommodities(list);
          sessionStorage.setItem('forecast-commodity-list', JSON.stringify(list));
          if (!list.length) setSelectedId(null);
          else if (selectedId == null || !list.some((c) => c.id === selectedId)) setSelectedId(list[0].id);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load commodities with data');
          setCommodities([]);
          setSelectedId(null);
        }
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
        const res = await api.get<ForecastData>(`/forecasts/${selectedId}?horizon=21`);
        const data = res && 'data' in res ? (res as { data?: ForecastData }).data : undefined;
        if (!cancelled) setForecastData(data ?? null);
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

  const chartData = useMemo(() => {
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
  }, [forecastData]);

  const firstForecast = forecastData?.forecast?.[0];
  const lastForecast = forecastData?.forecast?.length
    ? forecastData.forecast[forecastData.forecast.length - 1]
    : null;
  const hasAnyData = (forecastData?.historical?.length ?? 0) > 0 || (forecastData?.forecast?.length ?? 0) > 0;

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
          <p className="text-gray-600">Loading commodities with data...</p>
        ) : commodities.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <p className="font-medium">No commodities with data yet</p>
            <p className="mt-1 text-sm">
              The dropdown only lists commodities that already have model forecasts in RDS. Seed or insert rows into the <code className="bg-amber-100 px-1 rounded">forecasts</code> table to see them here.
            </p>
          </div>
        ) : (
          <>
            {/* Searchable dropdown – only commodities that have forecast rows */}
            <div className="mb-8 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select commodity (with forecast data)</label>
              <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex items-center justify-between w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm',
                      'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      {selectedCommodity
                        ? `${selectedCommodity.name}${selectedCommodity.category ? ` (${selectedCommodity.category})` : ''}`
                        : 'Search and select a commodity...'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] border border-gray-200 bg-white p-0 shadow-lg opacity-100"
                  align="start"
                >
                  <Command shouldFilter={true} className="bg-white">
                    <CommandInput
                      placeholder="Search commodity by name or category..."
                      className="bg-white"
                    />
                    <CommandList className="bg-white">
                      <CommandEmpty>No commodity found.</CommandEmpty>
                      <CommandGroup>
                        {commodities.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={`${c.name} ${c.category ?? ''}`}
                            onSelect={() => {
                              setSelectedId(c.id);
                              setDropdownOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <div>
                              <div className="font-medium">{c.name}</div>
                              {c.category && (
                                <div className="text-xs text-gray-500">{c.category}</div>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {loadingForecast ? (
              <p className="text-gray-600">Loading forecast data...</p>
            ) : forecastData ? (
              <>
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {forecastData.commodity_name} – Historical & model forecast
                  </h2>
                  {chartData.length > 0 && hasAnyData ? (
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
                        <ReferenceLine
                          x={chartData.filter((d) => d.actual != null).pop()?.date}
                          stroke="#94a3b8"
                          strokeDasharray="2 2"
                        />
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
                    <div className="h-64 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-500 gap-2 p-4">
                      <p className="font-medium">No historical or forecast data in RDS for this commodity.</p>
                      <p className="text-sm text-center">
                        Add price history and forecast records to the database to see the chart and predictions here.
                      </p>
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
                        ? `₹${Number(firstForecast.predicted_price).toLocaleString()}`
                        : '—'}
                    </div>
                    <div className="text-gray-600 mt-2 text-sm">
                      {firstForecast != null && firstForecast.lower_bound != null && firstForecast.upper_bound != null
                        ? `Range: ₹${Number(firstForecast.lower_bound).toLocaleString()} – ₹${Number(firstForecast.upper_bound).toLocaleString()}`
                        : 'From RDS forecast data'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold">End of horizon</h3>
                    </div>
                    <div className="text-3xl font-bold">
                      {lastForecast != null
                        ? `₹${Number(lastForecast.predicted_price).toLocaleString()}`
                        : '—'}
                    </div>
                    <div className="text-gray-600 mt-2 text-sm">
                      {lastForecast != null ? `Confidence: ${(Number(lastForecast.confidence) * 100).toFixed(0)}%` : '—'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold">Model accuracy</h3>
                    </div>
                    <div className="text-3xl font-bold">{Number(forecastData.accuracy ?? 0)}%</div>
                    <div className="text-gray-600 mt-2 text-sm">From RDS forecast data</div>
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
              <p className="text-gray-600">Select a commodity above to load its forecast data.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
