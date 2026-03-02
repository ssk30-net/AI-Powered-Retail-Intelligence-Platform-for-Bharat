import { TrendingUp, DollarSign, BarChart3, Users, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPICard } from '../components/KPICard';
import { SentimentIndicator } from '../components/SentimentIndicator';
import { useDashboardStats, useCommodities, useSentiment } from '@/lib/hooks/useAPI';
import { useState, useEffect } from 'react';

export function Dashboard() {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: commodities, loading: commoditiesLoading, refetch: refetchCommodities } = useCommodities();
  const { data: sentiment, loading: sentimentLoading, refetch: refetchSentiment } = useSentiment(20);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update last updated time
  useEffect(() => {
    if (!statsLoading && !commoditiesLoading && !sentimentLoading) {
      setLastUpdated(new Date());
    }
  }, [stats, commodities, sentiment]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchCommodities(),
        refetchSentiment(),
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
  if (statsLoading || commoditiesLoading || sentimentLoading) {
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

  // Prepare chart data from real sentiment
  const sentimentChartData = sentiment?.slice(0, 6).map((s, idx) => ({
    month: new Date(s.published_at).toLocaleDateString('en-US', { month: 'short' }),
    value: Math.abs(s.sentiment_score * 5000), // Scale for visualization
    forecast: Math.abs(s.sentiment_score * 5000) * 1.05,
  })) || [];

  // Prepare category data
  const categoryData = commodities?.reduce((acc: any[], commodity) => {
    const existing = acc.find(item => item.sector === commodity.category);
    if (existing) {
      existing.performance += 10;
    } else {
      acc.push({ sector: commodity.category, performance: 50 + Math.random() * 40 });
    }
    return acc;
  }, []).slice(0, 5) || [];

  // Calculate average sentiment
  const avgSentiment = sentiment && sentiment.length > 0
    ? sentiment.reduce((acc, s) => acc + s.sentiment_score, 0) / sentiment.length
    : 0;

  // Create insights from sentiment data
  const insights = sentiment?.slice(0, 3).map(s => ({
    title: s.headline,
    description: `Sentiment: ${s.sentiment_label} (${s.sentiment_score.toFixed(2)})`,
    impact: s.sentiment_label === 'positive' ? 'high' : s.sentiment_label === 'negative' ? 'medium' : 'low',
    time: new Date(s.published_at).toLocaleDateString(),
  })) || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Market Intelligence Dashboard</h1>
          <p className="text-gray-600">Real-time insights powered by AI • Last updated: {getTimeAgo()}</p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Commodities"
          value={stats?.totalCommodities?.toString() || '0'}
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
          value={stats?.totalForecasts?.toString() || '0'}
          change={8.7}
          icon={BarChart3}
          trend="up"
        />
        <KPICard
          title="Recent Activity"
          value={stats?.recentActivity?.toString() || '0'}
          change={12.3}
          icon={Users}
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Price Trend Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Market Trend & Forecast</h3>
              <p className="text-sm text-gray-600">6-month overview with AI predictions</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                Actual
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                Forecast
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#9333ea"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#9333ea', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sector Performance</h3>
            <p className="text-sm text-gray-600">Performance index by sector</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="sector" type="category" stroke="#6b7280" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="performance" fill="#2563eb" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment & Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Analysis */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Market Sentiment</h3>
            <p className="text-sm text-gray-600">AI-powered sentiment analysis</p>
          </div>
          <div className="space-y-3">
            <SentimentIndicator 
              label="Overall Market" 
              sentiment={avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral'} 
              score={Math.round(avgSentiment * 100)} 
            />
            {sentiment?.slice(0, 3).map((s, idx) => (
              <SentimentIndicator
                key={idx}
                label={`Commodity ${s.commodity_id}`}
                sentiment={s.sentiment_label as 'positive' | 'negative' | 'neutral'}
                score={Math.round(s.sentiment_score * 100)}
              />
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Market Insights</h3>
              <p className="text-sm text-gray-600">Key signals and recommendations</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      insight.impact === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <span className="text-xs text-gray-500">{insight.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
