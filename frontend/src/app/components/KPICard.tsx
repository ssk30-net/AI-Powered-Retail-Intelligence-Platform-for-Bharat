import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
}

export function KPICard({ title, value, change, icon: Icon, trend = 'up' }: KPICardProps) {
  const isPositive = trend === 'up' ? change > 0 : change < 0;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{value}</h3>
          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
