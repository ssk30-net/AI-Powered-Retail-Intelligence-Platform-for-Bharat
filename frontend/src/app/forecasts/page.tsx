'use client';

import { useState } from 'react';
import { TrendingUp, Calendar, DollarSign, TrendingDown } from 'lucide-react';

export default function ForecastsPage() {
  const [selectedCommodity, setSelectedCommodity] = useState('wheat');

  const commodities = [
    { id: 'wheat', name: 'Wheat', price: 245.50, change: 2.3 },
    { id: 'rice', name: 'Rice', price: 189.75, change: -1.2 },
    { id: 'corn', name: 'Corn', price: 156.20, change: 3.5 },
    { id: 'soybean', name: 'Soybean', price: 412.80, change: 1.8 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Price Forecasts</h1>

        {/* Commodity Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {commodities.map((commodity) => (
            <button
              key={commodity.id}
              onClick={() => setSelectedCommodity(commodity.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedCommodity === commodity.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="text-lg font-semibold">{commodity.name}</div>
              <div className="text-2xl font-bold mt-2">${commodity.price}</div>
              <div className={`flex items-center mt-2 ${commodity.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {commodity.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span>{Math.abs(commodity.change)}%</span>
              </div>
            </button>
          ))}
        </div>

        {/* Forecast Chart Placeholder */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">30-Day Price Forecast</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-gray-500">Chart visualization will be displayed here</div>
          </div>
        </div>

        {/* Forecast Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Next Week</h3>
            </div>
            <div className="text-3xl font-bold">$248.30</div>
            <div className="text-green-600 mt-2">+1.1% increase expected</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Next Month</h3>
            </div>
            <div className="text-3xl font-bold">$252.80</div>
            <div className="text-green-600 mt-2">+3.0% increase expected</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Confidence</h3>
            </div>
            <div className="text-3xl font-bold">87%</div>
            <div className="text-gray-600 mt-2">High accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}
