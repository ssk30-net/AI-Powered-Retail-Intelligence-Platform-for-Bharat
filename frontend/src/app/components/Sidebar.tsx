'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, LineChart, Lightbulb, Activity } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/forecasts', label: 'Forecasts', icon: TrendingUp },
    { path: '/price-sensitivity', label: 'Price Analysis', icon: LineChart },
    { path: '/insights', label: 'Insights', icon: Lightbulb },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">AI Market Pulse</h1>
            <p className="text-xs text-gray-500">Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="px-4 py-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">v0.1.0</p>
          <p className="text-xs text-gray-500 mt-1">Prototype</p>
        </div>
      </div>
    </aside>
  );
}