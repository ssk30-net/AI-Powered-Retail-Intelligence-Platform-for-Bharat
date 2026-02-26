import { Sparkles, TrendingUp, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const aiInsights = [
  {
    type: 'opportunity',
    title: 'Tech Sector Breakout Detected',
    description: 'Machine learning algorithms detected a bullish pattern in technology stocks with 87% confidence. Historical data suggests potential 12-15% upside in the next 30 days.',
    impact: 'High',
    confidence: 87,
    timeframe: '30 days',
    icon: TrendingUp,
    color: 'green',
  },
  {
    type: 'warning',
    title: 'Volatility Spike Expected',
    description: 'Multiple indicators suggest increased market volatility ahead of Federal Reserve announcements. Consider defensive positioning or hedging strategies.',
    impact: 'Medium',
    confidence: 74,
    timeframe: '7-14 days',
    icon: AlertTriangle,
    color: 'orange',
  },
  {
    type: 'info',
    title: 'Emerging Market Correlation',
    description: 'AI detected unusual correlation between Asian markets and cryptocurrency trends. This presents potential arbitrage opportunities for sophisticated traders.',
    impact: 'Medium',
    confidence: 68,
    timeframe: 'Ongoing',
    icon: Info,
    color: 'blue',
  },
  {
    type: 'opportunity',
    title: 'Energy Sector Undervalued',
    description: 'Fundamental analysis suggests energy stocks are trading below intrinsic value. AI models predict mean reversion over Q2 2026.',
    impact: 'High',
    confidence: 81,
    timeframe: '60-90 days',
    icon: CheckCircle,
    color: 'green',
  },
];

const sentimentTrend = [
  { date: 'Feb 10', sentiment: 65 },
  { date: 'Feb 17', sentiment: 68 },
  { date: 'Feb 24', sentiment: 72 },
  { date: 'Mar 3', sentiment: 70 },
  { date: 'Mar 10', sentiment: 75 },
  { date: 'Mar 17', sentiment: 78 },
  { date: 'Mar 24', sentiment: 76 },
];

const sectorDistribution = [
  { name: 'Technology', value: 32, color: '#3b82f6' },
  { name: 'Finance', value: 24, color: '#8b5cf6' },
  { name: 'Healthcare', value: 18, color: '#10b981' },
  { name: 'Energy', value: 14, color: '#f59e0b' },
  { name: 'Consumer', value: 12, color: '#ef4444' },
];

const newsImpact = [
  {
    headline: 'Fed Signals Rate Hold Through Q2',
    source: 'Federal Reserve',
    sentiment: 'positive',
    impact: 92,
    time: '3 hours ago',
  },
  {
    headline: 'Tech Giants Report Record Earnings',
    source: 'Market Watch',
    sentiment: 'positive',
    impact: 88,
    time: '5 hours ago',
  },
  {
    headline: 'Inflation Data Beats Expectations',
    source: 'Bureau of Labor Statistics',
    sentiment: 'positive',
    impact: 75,
    time: '1 day ago',
  },
  {
    headline: 'Trade Tensions Escalate',
    source: 'Reuters',
    sentiment: 'negative',
    impact: 65,
    time: '2 days ago',
  },
];

export function Insights() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-semibold text-gray-900">AI Market Insights</h1>
        </div>
        <p className="text-gray-600">Advanced analytics and machine learning powered market intelligence</p>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {aiInsights.map((insight, idx) => {
          const Icon = insight.icon;
          const colorConfig = {
            green: {
              bg: 'bg-green-50',
              border: 'border-green-200',
              text: 'text-green-700',
              icon: 'text-green-600',
            },
            orange: {
              bg: 'bg-orange-50',
              border: 'border-orange-200',
              text: 'text-orange-700',
              icon: 'text-orange-600',
            },
            blue: {
              bg: 'bg-blue-50',
              border: 'border-blue-200',
              text: 'text-blue-700',
              icon: 'text-blue-600',
            },
          };
          const config = colorConfig[insight.color];

          return (
            <div key={idx} className={`bg-white rounded-xl p-6 border ${config.border}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${config.icon}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <span className={`text-xs font-medium px-2 py-1 ${config.bg} ${config.text} rounded-full`}>
                      {insight.impact} Impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{insight.timeframe}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Confidence:</span>
                      <span className={`font-medium ${config.text}`}>{insight.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${
                    insight.color === 'green'
                      ? 'from-green-500 to-emerald-600'
                      : insight.color === 'orange'
                      ? 'from-orange-500 to-amber-600'
                      : 'from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${insight.confidence}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Market Sentiment Trend</h3>
            <p className="text-sm text-gray-600">6-week sentiment analysis</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sentimentTrend}>
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
              <Bar dataKey="sentiment" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Portfolio Sector Distribution</h3>
            <p className="text-sm text-gray-600">Current allocation</p>
          </div>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="60%" height={250}>
              <PieChart>
                <Pie
                  data={sectorDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sectorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {sectorDistribution.map((sector, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sector.color }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sector.name}</p>
                    <p className="text-xs text-gray-500">{sector.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News Impact Analysis */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">News Impact Analysis</h3>
          <p className="text-sm text-gray-600">AI-powered sentiment analysis of major market news</p>
        </div>
        <div className="space-y-4">
          {newsImpact.map((news, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{news.headline}</h4>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      news.sentiment === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {news.sentiment}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.time}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Impact Score</p>
                <p className="text-xl font-semibold text-gray-900">{news.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
