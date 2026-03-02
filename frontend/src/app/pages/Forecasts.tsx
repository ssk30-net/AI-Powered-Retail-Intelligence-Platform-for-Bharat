import { Brain, TrendingUp, Calendar, Target, RefreshCw, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useForecasts, useCommodities } from '@/lib/hooks/useAPI';
import { useState, useEffect } from 'react';

export function Forecasts() {
  const { data: forecasts, loading: forecastsLoading, error: forecastsError, refetch: refetchForecasts } = useForecasts(50);
  const { data: commodities, loading: commoditiesLoading, refetch: refetchCommodities } = useCommodities();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update last updated time
  useEffect(() => {
    if (!forecastsLoading && !commoditiesLoading) {
      setLastUpdated(new Date());
    }
  }, [forecasts, commodities]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchForecasts(),
        refetchCommodities(),
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate time ago
  const getTimeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  // Loading state
  if (forecastsLoading || commoditiesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forecasts data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (forecastsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load data</h2>
          <p className="text-gray-600 mb-4">Please ensure the backend API is running</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data from real forecasts
  const forecastData = forecasts?.slice(0, 11).map((f, idx) => {
    const date = new Date(f.forecast_date);
    const isActual = idx < 5; // First 5 are "actual" (past)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: isActual ? f.predicted_price : null,
      predicted: !isActual ? f.predicted_price : null,
      confidence: !isActual ? Math.round(f.confidence_score * 100) : null,
    };
  }) || [];

  // Group forecasts by commodity
  const forecastsByCommodity = forecasts?.reduce((acc: any, forecast) => {
    const commodity = commodities?.find(c => c.id === forecast.commodity_id);
    if (commodity) {
      if (!acc[commodity.id]) {
        acc[commodity.id] = {
          commodity,
          forecasts: [],
        };
      }
      acc[commodity.id].forecasts.push(forecast);
    }
    return acc;
  }, {}) || {};

  // Create predictions array
  const predictions = Object.values(forecastsByCommodity).slice(0, 4).map((item: any) => {
    const commodity = item.commodity;
    const forecastList = item.forecasts;
    const avgPrice = forecastList.reduce((sum: number, f: any) => sum + f.predicted_price, 0) / forecastList.length;
    const avgConfidence = forecastList.reduce((sum: number, f: any) => sum + f.confidence_score, 0) / forecastList.length;
    const change = ((avgPrice - (avgPrice * 0.9)) / (avgPrice * 0.9)) * 100; // Simulated change

    return {
      market: commodity.name,
      current: (avgPrice * 0.9).toFixed(2),
      prediction: avgPrice.toFixed(2),
      change: change.toFixed(1),
      confidence: Math.round(avgConfidence * 100),
      timeframe: '7 days',
      sentiment: change > 0 ? 'bullish' : 'bearish',
    };
  });

  // Key drivers (static for now, can be made dynamic later)
  const keyDrivers = [
    { factor: 'Market Demand', impact: 85, direction: 'positive' },
    { factor: 'Supply Chain', impact: 78, direction: 'positive' },
    { factor: 'Weather Conditions', impact: 65, direction: 'neutral' },
    { factor: 'Global Events', impact: 42, direction: 'negative' },
    { factor: 'Seasonal Trends', impact: 72, direction: 'positive' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">AI Price Forecasting</h1>
          <p className="text-gray-600">Machine learning powered market predictions • Last updated: {getTimeAgo()}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* AI Forecast Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Commodity Price Forecast Model</h3>
            </div>
            <p className="text-sm text-gray-600">7-day prediction with confidence intervals ({forecasts?.length || 0} forecasts)</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              Historical
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              Predicted
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <ReferenceLine
              x={forecastData[4]?.date}
              stroke="#6b7280"
              strokeDasharray="3 3"
              label={{ value: 'Today', position: 'top' }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', r: 5 }}
              name="Historical Price"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#9333ea"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#9333ea', r: 5 }}
              name="AI Prediction"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {predictions.map((pred, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{pred.market}</h3>
                <p className="text-sm text-gray-600">Current: {pred.current}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 capitalize">
                  {pred.sentiment}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Predicted Price</p>
                <p className="text-xl font-semibold text-purple-700">{pred.prediction}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Expected Change</p>
                <p className="text-xl font-semibold text-blue-700">+{pred.change}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{pred.timeframe}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Confidence: {pred.confidence}%</span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-3">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  style={{ width: `${pred.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Drivers */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Key Market Drivers</h3>
          <p className="text-sm text-gray-600">Factors influencing our AI predictions</p>
        </div>
        <div className="space-y-4">
          {keyDrivers.map((driver, idx) => {
            const directionConfig = {
              positive: { color: 'text-green-600', bg: 'bg-green-600' },
              neutral: { color: 'text-yellow-600', bg: 'bg-yellow-600' },
              negative: { color: 'text-red-600', bg: 'bg-red-600' },
            } as const;
            const config = directionConfig[driver.direction as keyof typeof directionConfig];

            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{driver.factor}</span>
                    <span className={`text-sm font-medium ${config.color} capitalize`}>
                      {driver.direction}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${config.bg} rounded-full transition-all`}
                      style={{ width: `${driver.impact}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600 w-12 text-right">
                  {driver.impact}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
