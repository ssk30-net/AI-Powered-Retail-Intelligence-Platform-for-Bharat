'use client';

import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to AI Market Pulse</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+5.2%</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Price Change</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">+5.2%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-blue-600 text-sm font-medium">78/100</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Demand Index</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">78</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">Positive</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Sentiment Score</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">0.65</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-yellow-600 text-sm font-medium">Medium</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Risk Level</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">Medium</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 text-center border border-blue-200">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Coming Soon</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We are building an amazing dashboard with price trends, forecasts, and market intelligence.
          Stay tuned!
        </p>
      </div>
    </div>
  );
}
