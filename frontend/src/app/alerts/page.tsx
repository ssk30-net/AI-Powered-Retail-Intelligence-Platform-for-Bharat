'use client';

import { Bell, AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';

export default function AlertsPage() {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Wheat Price Spike Alert',
      message: 'Wheat prices increased by 5% in the last 24 hours',
      time: '2 hours ago',
      severity: 'high',
    },
    {
      id: 2,
      type: 'info',
      title: 'New Market Report Available',
      message: 'Monthly commodity market analysis is now available',
      time: '5 hours ago',
      severity: 'low',
    },
    {
      id: 3,
      type: 'success',
      title: 'Forecast Accuracy Improved',
      message: 'Rice price forecast accuracy reached 92%',
      time: '1 day ago',
      severity: 'medium',
    },
    {
      id: 4,
      type: 'warning',
      title: 'Supply Chain Disruption',
      message: 'Potential delays in corn shipments detected',
      time: '2 days ago',
      severity: 'high',
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      case 'success':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Mark All as Read
          </button>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Total Alerts</div>
                <div className="text-2xl font-bold">{alerts.length}</div>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">High Priority</div>
                <div className="text-2xl font-bold">
                  {alerts.filter((a) => a.severity === 'high').length}
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Unread</div>
                <div className="text-2xl font-bold">{alerts.length}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow border-l-4 ${getAlertColor(alert.severity)} p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{alert.title}</h3>
                      <p className="text-gray-600 mb-2">{alert.message}</p>
                      <span className="text-sm text-gray-500">{alert.time}</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : alert.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
