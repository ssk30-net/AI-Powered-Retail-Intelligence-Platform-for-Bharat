import { TrendingUp, Target, DollarSign, Info, Sliders } from 'lucide-react';

export function PriceForecast() {
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Price Forecast</h1>
        <p className="text-gray-600 dark:text-gray-400">AI-powered price prediction and analysis</p>
      </div>

      {/* Main Forecast Chart */}
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Historical & Forecast Price Chart
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">12-month analysis with AI predictions</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Historical</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="w-3 h-3 bg-gray-700 dark:bg-gray-300 rounded-full"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Forecast</span>
            </div>
          </div>
        </div>
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">Chart Wireframe</p>
            <p className="text-xs text-gray-400 dark:text-gray-600">Line Chart with Confidence Intervals</p>
          </div>
        </div>
      </div>

      {/* Forecast Controls & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Price Sensitivity Slider */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Price Sensitivity</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Adjust forecast parameters</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Confidence Level</span>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">85%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full">
                <div className="h-full w-[85%] bg-gray-700 dark:bg-gray-300 rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Time Horizon</span>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">90 days</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full">
                <div className="h-full w-[60%] bg-gray-700 dark:bg-gray-300 rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Volatility Factor</span>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Medium</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full">
                <div className="h-full w-[50%] bg-gray-700 dark:bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Interval */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confidence Interval</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">90-day forecast range</p>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Upper Bound</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$1,425.00</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Predicted Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$1,285.50</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lower Bound</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$1,156.00</p>
            </div>
          </div>
        </div>

        {/* Revenue Impact */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue Impact</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Projected business impact</p>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Expected Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$2.4M</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <span className="text-xs text-gray-500 dark:text-gray-500">+15.2%</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cost Impact</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$1.8M</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <span className="text-xs text-gray-500 dark:text-gray-500">+8.5%</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Net Margin</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">25.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation Panel */}
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Model Explanation</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          How our AI arrived at this forecast
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Historical Patterns', 'Market Indicators', 'Seasonal Trends', 'External Factors'].map(
            (factor, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{factor}</p>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-4/5 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-3/5 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
