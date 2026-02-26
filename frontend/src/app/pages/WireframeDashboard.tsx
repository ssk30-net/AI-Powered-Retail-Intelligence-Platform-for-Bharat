import { TrendingUp, Activity, Heart, AlertTriangle, MapPin, Bell, Upload } from 'lucide-react';
import { useNavigate } from 'react-router';

export function WireframeDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Market Intelligence Overview</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Upload className="w-5 h-5" />
          Upload More Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">KPI</div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Price Trend</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">$1,247.50</h3>
          <div className="flex items-center gap-1">
            <div className="w-12 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <span className="text-xs text-gray-500 dark:text-gray-500">+12.5%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">KPI</div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Demand Index</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">87.3</h3>
          <div className="flex items-center gap-1">
            <div className="w-12 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <span className="text-xs text-gray-500 dark:text-gray-500">+8.2%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">KPI</div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sentiment Score</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">72%</h3>
          <div className="flex items-center gap-1">
            <div className="w-12 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <span className="text-xs text-gray-500 dark:text-gray-500">Positive</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">KPI</div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Risk Level</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Medium</h3>
          <div className="flex items-center gap-1">
            <div className="w-12 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <span className="text-xs text-gray-500 dark:text-gray-500">Stable</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Commodity Price Trend Chart */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Commodity Price Trend
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">6-month historical data</p>
            </div>
            <div className="flex gap-2">
              <div className="w-16 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="w-16 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-500">Chart Wireframe</p>
              <p className="text-xs text-gray-400 dark:text-gray-600">Line Chart Placeholder</p>
            </div>
          </div>
        </div>

        {/* Regional Demand Heatmap */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Regional Demand Heatmap
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Geographic distribution</p>
            </div>
            <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-600" />
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-500">Map Wireframe</p>
              <p className="text-xs text-gray-400 dark:text-gray-600">Heatmap Placeholder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Recent Alerts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 24 hours</p>
            </div>
            <Bell className="w-5 h-5 text-gray-400 dark:text-gray-600" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                AI Insights Summary
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Key market signals</p>
            </div>
            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="w-2/3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-5/6 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}