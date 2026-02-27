import { AlertTriangle, Clock, TrendingUp, Activity, Bell } from 'lucide-react';

export function RiskAlerts() {
  const alerts = [
    { severity: 'high', type: 'Volatility Spike', time: '2 hours ago' },
    { severity: 'medium', type: 'Demand Surge', time: '5 hours ago' },
    { severity: 'high', type: 'Price Anomaly', time: '1 day ago' },
    { severity: 'low', type: 'Trend Shift', time: '1 day ago' },
    { severity: 'medium', type: 'Supply Constraint', time: '2 days ago' },
  ];

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-8 h-8 text-gray-900 dark:text-gray-100" />
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Risk Alerts</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Real-time risk monitoring and notifications</p>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Critical Alerts', count: '3', color: 'red' },
          { label: 'High Priority', count: '7', color: 'orange' },
          { label: 'Medium Risk', count: '12', color: 'yellow' },
          { label: 'Resolved', count: '45', color: 'green' },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              <Bell className="w-5 h-5 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{item.label}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{item.count}</h3>
          </div>
        ))}
      </div>

      {/* Alert Timeline */}
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Alert Timeline
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Recent alerts and notifications</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg">
              All
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
              Critical
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
              Active
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {alerts.map((alert, i) => {
            const severityConfig = {
              high: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-300 dark:border-red-700' },
              medium: { bg: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-300 dark:border-yellow-700' },
              low: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-700' },
            };
            const config = severityConfig[alert.severity];

            return (
              <div
                key={i}
                className={`p-5 ${config.bg} border-2 ${config.border} rounded-lg`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {alert.type}
                      </h4>
                      <span className="text-xs text-gray-600 dark:text-gray-400 uppercase px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded">
                        {alert.severity}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-5/6 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{alert.time}</span>
                      </div>
                      <button className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid - Volatility & Demand Surge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volatility Alerts */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Volatility Indicators
            </h3>
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center mb-6">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-500">Chart Wireframe</p>
              <p className="text-xs text-gray-400 dark:text-gray-600">Volatility Index</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Low', 'Medium', 'High'].map((level, i) => (
              <div
                key={i}
                className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center"
              >
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{level}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{(i + 1) * 3}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Demand Surge Indicators */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Demand Surge Alerts
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { region: 'North America', surge: '+45%', status: 'Critical' },
              { region: 'Europe', surge: '+28%', status: 'High' },
              { region: 'Asia Pacific', surge: '+15%', status: 'Medium' },
              { region: 'Latin America', surge: '+8%', status: 'Low' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.region}</h4>
                  <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                    <div
                      className="h-full bg-gray-700 dark:bg-gray-300 rounded-full"
                      style={{ width: item.surge }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.surge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
