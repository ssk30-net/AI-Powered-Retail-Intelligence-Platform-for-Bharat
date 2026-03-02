'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, BarChart3, Users, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KPICard } from '@/app/components/KPICard';
import { SentimentIndicator } from '@/app/components/SentimentIndicator';
import api from '@/lib/api';

interface DashboardOverview {
  kpis: {
    price_change_percent: number;
    demand_index: number;
    sentiment_score: number;
    risk_level: string;
  };
  top_commodities: Array<{ id: number; name: string; price: number; change: number }>;
  recent_alerts: unknown[];
}

interface PriceTrendsResponse {
  trends: Array<{
    commodity_id: number;
    commodity_name: string;
    data_points: Array<{ date: string; price: number }>;
  }>;
}

const defaultOverview: DashboardOverview = {
  kpis: {
    price_change_percent: 0,
    demand_index: 0,
    sentiment_score: 0,
    risk_level: 'low',
  },
  top_commodities: [],
  recent_alerts: [],
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview>(defaultOverview);
  const [trends, setTrends] = useState<PriceTrendsResponse['trends']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [overviewRes, trendsRes] = await Promise.all([
          api.get<DashboardOverview>('/dashboard/overview'),
          api.get<{ trends: PriceTrendsResponse['trends'] }>('/dashboard/price-trends?commodity_ids=1,2,3&days=30'),
        ]);
        if (!cancelled && overviewRes.data) setOverview(overviewRes.data);
        if (!cancelled && trendsRes.data?.trends) setTrends(trendsRes.data.trends);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard');
        setOverview(defaultOverview);
        setTrends([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const { kpis, top_commodities } = overview;
  const chartData = trends[0]?.data_points?.length
    ? trends[0].data_points.map((d) => ({ month: d.date?.slice(5) || d.date, value: d.price, forecast: d.price }))
    : [];

  const sentimentScore = Math.round((Number(kpis.sentiment_score) || 0) * 100);
  const sentimentLabel = sentimentScore >= 60 ? 'positive' : sentimentScore >= 40 ? 'neutral' : 'negative';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading dashboard from RDS...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {error && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          {error}
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Market Intelligence Dashboard</h1>
        <p className="text-gray-600">Insights from RDS • Price history & forecasts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Price change (avg %)"
          value={`${kpis.price_change_percent >= 0 ? '+' : ''}${kpis.price_change_percent}%`}
          change={kpis.price_change_percent}
          icon={DollarSign}
          trend={kpis.price_change_percent >= 0 ? 'up' : 'down'}
        />
        <KPICard
          title="Demand index"
          value={String(kpis.demand_index)}
          change={kpis.demand_index >= 50 ? 5 : -5}
          icon={BarChart3}
          trend={kpis.demand_index >= 50 ? 'up' : 'down'}
        />
        <KPICard
          title="Sentiment score"
          value={`${sentimentScore}%`}
          change={sentimentScore - 50}
          icon={TrendingUp}
          trend={sentimentScore >= 50 ? 'up' : 'down'}
        />
        <KPICard
          title="Risk level"
          value={kpis.risk_level}
          change={kpis.risk_level === 'high' ? -10 : kpis.risk_level === 'medium' ? 0 : 5}
          icon={Users}
          trend={kpis.risk_level === 'high' ? 'down' : 'up'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Price trend (RDS)</h3>
              <p className="text-sm text-gray-600">
                {trends[0] ? trends[0].commodity_name : 'No data'} • Last 30 days
              </p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
              No price history in RDS yet. Add data to see trends.
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top commodities (RDS)</h3>
            <p className="text-sm text-gray-600">Latest prices from database</p>
          </div>
          {top_commodities.length > 0 ? (
            <div className="space-y-3">
              {top_commodities.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{c.name}</span>
                  <div className="text-right">
                    <span className="font-semibold">₹{Number(c.price).toLocaleString()}</span>
                    <span
                      className={`ml-2 text-sm ${c.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {c.change >= 0 ? '+' : ''}{c.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
              No commodity prices in RDS yet.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Market sentiment</h3>
            <p className="text-sm text-gray-600">From price movement</p>
          </div>
          <SentimentIndicator
            label="Overall"
            sentiment={sentimentLabel}
            score={sentimentScore}
          />
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
              <p className="text-sm text-gray-600">KPIs and top commodities are loaded from RDS.</p>
            </div>
            <a href="/forecasts" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View forecasts
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
          <p className="text-sm text-gray-600">
            Add commodities and price history in the database to see live trends. Forecasts from the model appear on the Forecasts page.
          </p>
        </div>
      </div>
    </div>
  );
}
