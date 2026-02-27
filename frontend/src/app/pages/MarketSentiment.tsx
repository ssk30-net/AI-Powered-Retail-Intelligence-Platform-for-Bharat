import { Heart, Newspaper, TrendingUp, BarChart3 } from 'lucide-react';

export function MarketSentiment() {
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Market Sentiment</h1>
        <p className="text-gray-600 dark:text-gray-400">AI-powered sentiment analysis and tracking</p>
      </div>

      {/* Top Row - Sentiment Gauge & News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Gauge */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Overall Sentiment Score
            </h3>
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center mb-6">
            <div className="text-center">
              <Heart className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">Gauge Wireframe</p>
              <p className="text-xs text-gray-400 dark:text-gray-600">Circular Sentiment Gauge</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">72%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">7-Day Avg</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">68%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Change</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">+4%</p>
            </div>
          </div>
        </div>

        {/* News Headlines */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Sentiment Sources
              </h3>
            </div>
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded ml-3"></div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sentiment Trend Graph */}
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Sentiment Trend Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">30-day sentiment tracking</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg">
              30D
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
              90D
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
              1Y
            </button>
          </div>
        </div>
        <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">Chart Wireframe</p>
            <p className="text-xs text-gray-400 dark:text-gray-600">Area Chart - Sentiment Over Time</p>
          </div>
        </div>
      </div>

      {/* Correlation with Price Movement */}
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Sentiment vs Price Correlation
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Correlation analysis between sentiment and price movements
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Correlation Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0.78</p>
          </div>
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">Chart Wireframe</p>
            <p className="text-xs text-gray-400 dark:text-gray-600">Dual-Axis Line Chart</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {['Strong Positive', 'Weak Positive', 'Weak Negative', 'Strong Negative'].map(
            (label, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
              >
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{45 - i * 10}%</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
