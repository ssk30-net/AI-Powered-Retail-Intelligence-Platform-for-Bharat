'use client';

import { Smile, Meh, Frown, TrendingUp, MessageSquare } from 'lucide-react';

export default function SentimentPage() {
  const sentimentData = [
    { category: 'Positive', count: 245, percentage: 65, color: 'bg-green-500' },
    { category: 'Neutral', count: 89, percentage: 24, color: 'bg-yellow-500' },
    { category: 'Negative', count: 41, percentage: 11, color: 'bg-red-500' },
  ];

  const newsItems = [
    { title: 'Wheat prices expected to rise', sentiment: 'positive', source: 'Market News', date: '2 hours ago' },
    { title: 'Rice harvest shows strong yield', sentiment: 'positive', source: 'Agriculture Today', date: '5 hours ago' },
    { title: 'Corn market remains stable', sentiment: 'neutral', source: 'Commodity Report', date: '1 day ago' },
    { title: 'Weather concerns for soybean', sentiment: 'negative', source: 'Farm Weekly', date: '2 days ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Market Sentiment Analysis</h1>

        {/* Overall Sentiment */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Overall Market Sentiment</h2>
          <div className="flex items-center justify-center mb-6">
            <Smile className="w-16 h-16 text-green-500" />
            <div className="ml-4">
              <div className="text-4xl font-bold">Positive</div>
              <div className="text-gray-600">Market outlook is favorable</div>
            </div>
          </div>

          {/* Sentiment Distribution */}
          <div className="space-y-4">
            {sentimentData.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-gray-600">{item.count} mentions ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Trending Topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Price Increase', 'Supply Chain', 'Weather Impact', 'Export Demand', 'Harvest Season'].map((topic) => (
              <span key={topic} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Recent News & Analysis</h2>
          </div>
          <div className="space-y-4">
            {newsItems.map((news, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{news.title}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{news.source}</span>
                      <span className="mx-2">•</span>
                      <span>{news.date}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      news.sentiment === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : news.sentiment === 'neutral'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {news.sentiment}
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
