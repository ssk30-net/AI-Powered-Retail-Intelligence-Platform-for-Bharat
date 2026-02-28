'use client';

import { TrendingUp, DollarSign, BarChart3, Users, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KPICard } from '@/app/components/KPICard';
import { SentimentIndicator } from '@/app/components/SentimentIndicator';

const marketData = [
  { month: 'Jan', value: 4200, forecast: 4100, volume: 320 },
  { month: 'Feb', value: 4500, forecast: 4400, volume: 380 },
  { month: 'Mar', value: 4300, forecast: 4350, volume: 340 },
  { month: 'Apr', value: 4800, forecast: 4700, volume: 420 },
  { month: 'May', value: 5200, forecast: 5100, volume: 480 },
  { month: 'Jun', value: 5600, forecast: 5500, volume: 520 },
];

const sectorPerformance = [
  { sector: 'Technology', performance: 85 },
  { sector: 'Finance', performance: 72 },
  { sector: 'Healthcare', performance: 68 },
  { sector: 'Energy', performance: 55 },
  { sector: 'Consumer', performance: 78 },
];

const insights = [
  {
    title: 'Tech Sector Momentum',
    description: 'AI and cloud computing stocks showing strong upward momentum with 15% growth over Q2.',
    impact: 'high',
    time: '2 hours ago',
  },
  {
    title: 'Federal Reserve Signal',
    description: 'Interest rate hints suggest potential market volatility in Q3. Recommended defensive positioning.',
    impact: 'medium',
    time: '5 hours ago',
  },
  {
    title: 'Emerging Market Opportunity',
    description: 'Southeast Asian markets presenting favorable entry points with strong GDP growth forecasts.',
    impact: 'high',
    time: '1 day ago',
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Market Intelligence Dashboard</h1>
        <p className="text-gray-600">Real-time insights powered by AI • Last updated: 2 minutes ago</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Market Cap"
          value="$2.4T"
          change={12.5}
          icon={DollarSign}
          trend="up"
        />
        <KPICard
          title="Trading Volume"
          value="18.2M"
          change={8.3}
          icon={BarChart3}
          trend="up"
        />
        <KPICard
          title="Active Signals"
          value="127"
          change={-3.2}
          icon={TrendingUp}
          trend="down"
        />
        <KPICard
          title="Portfolio Value"
          value="$845K"
          change={15.7}
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
            <LineChart data={marketData}>
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
            <BarChart data={sectorPerformance} layout="vertical">
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
            <SentimentIndicator label="Overall Market" sentiment="positive" score={78} />
            <SentimentIndicator label="Tech Sector" sentiment="positive" score={85} />
            <SentimentIndicator label="Energy Sector" sentiment="neutral" score={52} />
            <SentimentIndicator label="Social Media" sentiment="negative" score={-12} />
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
