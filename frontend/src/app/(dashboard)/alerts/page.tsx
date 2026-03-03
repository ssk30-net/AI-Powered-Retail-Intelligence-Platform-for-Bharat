'use client';

import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, TrendingUp, TrendingDown, Info, ShieldAlert } from 'lucide-react';
import { alertsAPI, type AlertItem } from '@/lib/api';
import toast from 'react-hot-toast';

function formatTimeAgo(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} days ago`;
  return d.toLocaleDateString();
}

function getAlertIcon(alertType: string) {
  switch (alertType) {
    case 'price_spike':
      return <TrendingUp className="w-6 h-6 text-amber-600" />;
    case 'supply_disruption':
      return <AlertTriangle className="w-6 h-6 text-red-600" />;
    case 'demand_change':
      return <TrendingDown className="w-6 h-6 text-blue-600" />;
    default:
      return <Info className="w-6 h-6 text-gray-600" />;
  }
}

function getAlertColor(severity: string) {
  switch (severity) {
    case 'high':
      return 'border-l-red-500 bg-red-50';
    case 'medium':
      return 'border-l-amber-500 bg-amber-50';
    case 'low':
      return 'border-l-blue-500 bg-blue-50';
    default:
      return 'border-l-gray-500 bg-gray-50';
  }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'risks'>('all');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertsAPI.getAlerts('all', 100);
      setAlerts(data.alerts);
      setUnreadCount(data.unread_count);
    } catch (e) {
      toast.error('Failed to load alerts');
      setAlerts([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAllRead = async () => {
    const unreadIds = alerts.filter((a) => !a.is_read).map((a) => a.id);
    if (unreadIds.length === 0) {
      toast.success('All alerts already read');
      return;
    }
    try {
      await alertsAPI.acknowledge(undefined, unreadIds);
      toast.success(`Marked ${unreadIds.length} alert(s) as read`);
      fetchAlerts();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const highSeverityOrRisk = (a: AlertItem) =>
    a.severity === 'high' ||
    a.alert_type === 'price_spike' ||
    a.alert_type === 'supply_disruption';

  const displayed =
    filter === 'unread'
      ? alerts.filter((a) => !a.is_read)
      : filter === 'risks'
        ? alerts.filter(highSeverityOrRisk)
        : alerts;

  const highCount = alerts.filter((a) => a.severity === 'high').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-600">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all as read
          </button>
        </div>

        {/* Tabs: All | Unread | Risks */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(['all', 'unread', 'risks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 font-medium rounded-t-lg capitalize ${
                filter === tab
                  ? 'bg-white border border-b-0 border-gray-200 -mb-px text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'risks' ? 'Risks' : tab}
              {tab === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
              {tab === 'risks' && highCount > 0 && ` (${highCount})`}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Total alerts</div>
                <div className="text-2xl font-bold text-gray-900">{alerts.length}</div>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">High priority</div>
                <div className="text-2xl font-bold text-gray-900">{highCount}</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Unread</div>
                <div className="text-2xl font-bold text-gray-900">{unreadCount}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Risks info when on Risks tab */}
        {filter === 'risks' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Risks view</p>
              <p className="text-sm text-amber-800">
                Showing high-severity alerts and price/supply-related events. Resolve or acknowledge from the list below.
              </p>
            </div>
          </div>
        )}

        {/* Alerts list */}
        <div className="space-y-4">
          {displayed.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              {filter === 'unread'
                ? 'No unread alerts.'
                : filter === 'risks'
                  ? 'No risk alerts at the moment.'
                  : 'No alerts yet. Alerts are created when prices move sharply or other events are detected.'}
            </div>
          ) : (
            displayed.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg shadow border-l-4 p-6 hover:shadow-md transition-shadow ${getAlertColor(
                  alert.severity
                )} ${!alert.is_read ? 'ring-1 ring-blue-200' : ''}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">{getAlertIcon(alert.alert_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{alert.title}</h3>
                        {alert.message && (
                          <p className="text-gray-600 mb-2 text-sm">{alert.message}</p>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(alert.triggered_at)}
                          {alert.commodity_name && ` · ${alert.commodity_name}`}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          alert.severity === 'high'
                            ? 'bg-red-100 text-red-700'
                            : alert.severity === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
