/**
 * Dynamic Dashboard - Connected to Real Backend API
 * This is an example of how to use the API hooks to fetch real data
 */
import { TrendingUp, DollarSign, BarChart3, Activity, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KPICard } from '../components/KPICard';
import { SentimentIndicator } from '../components/SentimentIndicator';
import {
  useDashboardStats,
  useCommodities,
  useSentiment,
  useForecasts,
  useRealtimeDashboard,
} from '@/lib/hooks/useAPI';

export function DynamicDashboard() {
  // Fetch data using hooks
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: commodities, loading: commoditiesLoading } = useCommodities();
  const { data: sentiment, loading: sentimentLoading } = useSentiment(20);
  const { data: forecasts, loading: forecastsLoading } = useForecasts(20);

  // Real-time updates (auto-refresh every 30 seconds)
  const { data: realtimeStats } = useRealtimeDashboard(30000);

  // Use real-time data if available, otherwise use regular data
  const displayStats = realtimeStats || stats;

  // Loading state
  if (statsLoading || commoditiesLoading || sentimentLoading || forecastsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Activity className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load data</h2>
          <p className="text-gray-600 mb-4">Please ensure the backend API is running</p>
          <button
            onClick={refetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data from real sentiment
  const sentimentChartData = sentiment?.slice(0, 10).map((s, idx) => ({
    date: new Date(s.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sentiment: s.sentiment_score,
    label: s.sentiment_label,
  })) || [];

  // Prepare commodity category data
  const categoryData = commodities?.reduce((acc: any[], commodity) => {
    const existing = acc.find(item => item.category === commodity.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ category: commodity.category, count: 1 });
    }
    return acc;
  }, []) || [];

  // Calculate sentiment distribution
  const sentimentDistribution = sentiment?.reduce((acc: any, s) => {
    acc[s.sentiment_label] = (acc[s.sentiment_label] || 0) + 1;
    return acc;
  }, {}) || {};

  // Calculate average sentiment
  const avgSentiment = sentiment && sentiment.length > 0
    ? sentiment.reduce((acc, s) => acc + s.sentiment_score, 0) / sentiment.length
    : 0;

  // Get sentiment label
  const getSentimentLabel = (score: number): 'positive' | 'neutral' | 'negative' => {
    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            AI Market Pulse Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time data from backend API • Auto-refreshes every 30 seconds
          </p>
        </div>
        <button
          onClick={refetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* KPI Cards with Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Commodities"
          value={displayStats?.totalCommodities?.toString() || '0'}
          change={5.2}
          icon={DollarSign}
          trend="up"
        />
        <KPICard
          title="Avg Sentiment"
          value={avgSentiment.toFixed(2)}
          change={2.1}
          icon={TrendingUp}
          trend={avgSentiment > 0 ? 'up' : 'down'}
        />
        <KPICard
          title="Active Forecasts"
          value={displayStats?.totalForecasts?.toString() || '0'}
          change={8.7}
          icon={BarChart3}
          trend="up"
        />
        <KPICard
          title="Recent Activity"
          value={displayStats?.recentActivity?.toString() || '0'}
          change={12.3}
          icon={Activity}
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Trend Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sentiment Trend</h3>
            <p className="text-sm text-gray-600">Recent sentiment scores from news analysis</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[-1, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Commodity Categories */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Commodities by Category</h3>
            <p className="text-sm text-gray-600">Distribution across categories</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment & Recent Data Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Sentiment */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Market Sentiment</h3>
            <p className="text-sm text-gray-600">Real-time sentiment analysis</p>
          </div>
          <div className="space-y-4">
            <SentimentIndicator
              label="Overall Market"
              sentiment={getSentimentLabel(avgSentiment)}
              score={Math.round(avgSentiment * 100)}
            />
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Positive</span>
                  <span className="font-semibold text-green-600">
                    {sentimentDistribution['positive'] || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Neutral</span>
                  <span className="font-semibold text-gray-600">
                    {sentimentDistribution['neutral'] || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Negative</span>
                  <span className="font-semibold text-red-600">
                    {sentimentDistribution['negative'] || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Commodities */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Commodities</h3>
            <p className="text-sm text-gray-600">Latest tracked commodities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commodities?.slice(0, 6).map((commodity) => (
              <div
                key={commodity.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
              >
                <h4 className="font-semibold text-gray-900 mb-1">{commodity.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{commodity.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Unit: {commodity.unit}</span>
                  <span className="text-xs font-medium text-blue-600">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sentiment News */}
      <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sentiment Analysis</h3>
          <p className="text-sm text-gray-600">Latest news and sentiment scores</p>
        </div>
        <div className="space-y-3">
          {sentiment?.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 mt-2 rounded-full ${
                    item.sentiment_label === 'positive'
                      ? 'bg-green-500'
                      : item.sentiment_label === 'negative'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{item.headline}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(item.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Score: <span className="font-medium">{item.sentiment_score.toFixed(2)}</span>
                    </span>
                    <span className="text-gray-600">
                      Label:{' '}
                      <span
                        className={`font-medium ${
                          item.sentiment_label === 'positive'
                            ? 'text-green-600'
                            : item.sentiment_label === 'negative'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {item.sentiment_label}
                      </span>
                    </span>
                    <span className="text-gray-600">Source: {item.source}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
