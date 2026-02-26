import { TrendingUp, Target, DollarSign, Users, Zap, Award, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

export function InsightsPerformance() {
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Insights & Performance Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive business intelligence and AI-driven strategic recommendations
        </p>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-[#1F3C88] to-[#00A8A8] rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-[#FF7A00]" />
          <h2 className="text-2xl font-bold">Executive Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Revenue Impact', value: '+$2.4M', change: '+15.2%' },
            { label: 'Cost Optimization', value: '$1.8M', change: '-12.5%' },
            { label: 'Forecast Accuracy', value: '87.3%', change: '+5.2%' },
            { label: 'Market Share', value: '23.5%', change: '+3.1%' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-white/80 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-[#FF7A00]" />
                <span className="text-sm font-medium text-[#FF7A00]">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Revenue Performance by Quarter
          </h3>
          <div className="space-y-4">
            {[
              { quarter: 'Q1 2026', revenue: '$4.2M', target: '$4.0M', achievement: 105 },
              { quarter: 'Q4 2025', revenue: '$3.8M', target: '$3.9M', achievement: 97 },
              { quarter: 'Q3 2025', revenue: '$3.5M', target: '$3.6M', achievement: 97 },
              { quarter: 'Q2 2025', revenue: '$3.2M', target: '$3.2M', achievement: 100 },
            ].map((quarter, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {quarter.quarter}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {quarter.revenue}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                      / {quarter.target}
                    </span>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`absolute h-full rounded-full ${
                      quarter.achievement >= 100
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-600'
                    }`}
                    style={{ width: `${Math.min(quarter.achievement, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Demand Trend Performance
          </h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-500">Demand Trend Graph</p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Opportunity Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Market Opportunity Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: 'Untapped Market Segment',
              opportunity: 'Southeast Asia',
              potential: '$5.2M ARR',
              confidence: 85,
              priority: 'High',
            },
            {
              icon: TrendingUp,
              title: 'Price Optimization',
              opportunity: 'Premium Product Line',
              potential: '12% Margin Increase',
              confidence: 78,
              priority: 'Medium',
            },
            {
              icon: Zap,
              title: 'Demand Surge Alert',
              opportunity: 'Q2 Seasonal Trend',
              potential: '35% Volume Increase',
              confidence: 92,
              priority: 'High',
            },
          ].map((opportunity, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-300 dark:border-gray-700 hover:border-[#1F3C88] dark:hover:border-[#00A8A8] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1F3C88] to-[#00A8A8] flex items-center justify-center">
                  <opportunity.icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    opportunity.priority === 'High'
                      ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                      : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                  }`}
                >
                  {opportunity.priority}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {opportunity.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {opportunity.opportunity}
              </p>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Potential</span>
                  <span className="text-sm font-semibold text-[#00A8A8]">{opportunity.potential}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {opportunity.confidence}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Accuracy & ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Forecast Accuracy Indicators
          </h3>
          <div className="space-y-6">
            {[
              { metric: 'Price Forecast', accuracy: 87, trend: 'up' },
              { metric: 'Demand Forecast', accuracy: 82, trend: 'up' },
              { metric: 'Sentiment Prediction', accuracy: 78, trend: 'stable' },
              { metric: 'Risk Assessment', accuracy: 91, trend: 'up' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.metric}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {item.accuracy}%
                    </span>
                    {item.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4"></div>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] rounded-full"
                    style={{ width: `${item.accuracy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            ROI Impact Visualization
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Revenue Increase
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">+$2.4M</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                From AI-optimized pricing strategies
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Cost Reduction
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">-$1.8M</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Through demand forecasting accuracy
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Net ROI
                </span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">340%</span>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Return on AI investment over 12 months
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Strategic Recommendations */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-300 dark:border-gray-700 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-[#FF7A00]" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI-Generated Strategic Recommendations
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Increase Q2 Inventory by 35%',
              reason: 'AI predicts seasonal demand surge based on historical patterns and sentiment analysis',
              impact: 'High',
              timeframe: 'Next 30 days',
            },
            {
              title: 'Adjust Premium Pricing +8%',
              reason: 'Market sentiment positive and competitor analysis shows pricing power opportunity',
              impact: 'Medium',
              timeframe: 'Immediate',
            },
            {
              title: 'Enter Southeast Asia Market',
              reason: 'Untapped demand detected with favorable market conditions and low competition',
              impact: 'High',
              timeframe: 'Q2 2026',
            },
            {
              title: 'Hedge Against Q3 Volatility',
              reason: 'Risk models predict 45% chance of price volatility in commodities',
              impact: 'Medium',
              timeframe: 'Next 60 days',
            },
          ].map((rec, i) => (
            <div
              key={i}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{rec.title}</h4>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    rec.impact === 'High'
                      ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {rec.impact}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.reason}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-500">Timeline:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{rec.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor Comparison */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-300 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Competitor Comparison Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Metric
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Your Business
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Competitor A
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Competitor B
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Industry Avg
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { metric: 'Market Share', you: '23.5%', a: '18.2%', b: '21.1%', avg: '15.3%' },
                { metric: 'Avg Price Point', you: '$124', a: '$118', b: '$132', avg: '$120' },
                { metric: 'Customer Satisfaction', you: '4.6/5', a: '4.2/5', b: '4.4/5', avg: '4.1/5' },
                { metric: 'Growth Rate (YoY)', you: '+15.2%', a: '+8.5%', b: '+11.3%', avg: '+7.8%' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {row.metric}
                  </td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-[#00A8A8]">
                    {row.you}
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-gray-600 dark:text-gray-400">
                    {row.a}
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-gray-600 dark:text-gray-400">
                    {row.b}
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-gray-600 dark:text-gray-400">
                    {row.avg}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
