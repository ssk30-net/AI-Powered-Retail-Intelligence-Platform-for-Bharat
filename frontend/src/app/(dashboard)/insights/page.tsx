'use client';

import { Lightbulb, TrendingUp, Target, Zap } from 'lucide-react';

export default function InsightsPage() {
  const insights = [
    {
      id: 1,
      title: 'Optimal Buying Opportunity',
      description: 'Rice prices are expected to increase by 8% next month. Consider purchasing now.',
      impact: 'High',
      category: 'Opportunity',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 2,
      title: 'Market Trend Shift',
      description: 'Wheat demand is showing upward momentum across all regions.',
      impact: 'Medium',
      category: 'Trend',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 3,
      title: 'Price Volatility Alert',
      description: 'Corn prices showing increased volatility. Monitor closely for the next 2 weeks.',
      impact: 'High',
      category: 'Risk',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 4,
      title: 'Seasonal Pattern Detected',
      description: 'Historical data suggests soybean prices typically rise in Q2.',
      impact: 'Medium',
      category: 'Pattern',
      icon: Lightbulb,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const recommendations = [
    { action: 'Buy', commodity: 'Rice', confidence: 87, reason: 'Price increase expected' },
    { action: 'Hold', commodity: 'Wheat', confidence: 72, reason: 'Stable market conditions' },
    { action: 'Monitor', commodity: 'Corn', confidence: 65, reason: 'High volatility detected' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Market Insights</h1>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div key={insight.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start">
                  <div className={`${insight.bgColor} p-3 rounded-lg mr-4`}>
                    <Icon className={`w-6 h-6 ${insight.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{insight.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          insight.impact === 'High'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {insight.impact} Impact
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {insight.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">AI-Powered Recommendations</h2>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      rec.action === 'Buy'
                        ? 'bg-green-100 text-green-700'
                        : rec.action === 'Hold'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {rec.action}
                  </div>
                  <div>
                    <div className="font-semibold">{rec.commodity}</div>
                    <div className="text-sm text-gray-600">{rec.reason}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{rec.confidence}%</div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 mb-2">Insights Generated</div>
            <div className="text-3xl font-bold">24</div>
            <div className="text-green-600 text-sm mt-2">+12% this week</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 mb-2">Accuracy Rate</div>
            <div className="text-3xl font-bold">89%</div>
            <div className="text-green-600 text-sm mt-2">+3% improvement</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 mb-2">Active Recommendations</div>
            <div className="text-3xl font-bold">{recommendations.length}</div>
            <div className="text-blue-600 text-sm mt-2">Updated daily</div>
          </div>
        </div>
      </div>
    </div>
  );
}
