import { NavLink } from 'react-router';
import { LayoutDashboard, TrendingUp, Heart, Bot, AlertTriangle, FileText, Lightbulb, Settings, Activity } from 'lucide-react';

export function WireframeSidebar() {
  const navItems = [
    { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/forecast', label: 'Forecast', icon: TrendingUp },
    { path: '/app/sentiment', label: 'Sentiment', icon: Heart },
    { path: '/app/copilot', label: 'AI Copilot', icon: Bot },
    { path: '/app/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/app/insights', label: 'Insights', icon: Lightbulb },
    { path: '/app/reports', label: 'Reports', icon: FileText },
    { path: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 dark:bg-gray-200 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white dark:text-gray-900" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">AI Market Pulse</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Wireframe v1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/app'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700">
        <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">Wireframe Mode</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Design Preview</p>
        </div>
      </div>
    </aside>
  );
}