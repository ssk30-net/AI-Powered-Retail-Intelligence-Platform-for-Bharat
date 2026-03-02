'use client';

import { useEffect, useState } from 'react';
import { Smile, Meh, Frown, MessageSquare, Loader } from 'lucide-react';
import { insightsAPI } from '@/lib/api';

export default function SentimentPage() {
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState('wheat');

  useEffect(() => {
    loadSentimentData();
  }, [selectedCommodity]);

  const loadSentimentData = async () => {
    setIsLoading(true);
    try {
      const data = await insightsAPI.getCommoditySentiment(selectedCommodity);
      setSentimentData(data);
    } catch (error) {
      console.error('Error loading sentiment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  const getSentimentIcon = () => {
    if (!sentimentData) return <Meh className="w-16 h-16 text-gray-500" />;
    const sentiment = sentimentData.overall_sentiment.toLowerCase();
    if (sentiment.includes('positive')) return <Smile className="w-16 h-16 text-green-500" />;
    if (sentiment.includes('negative')) return <Frown className="w-16 h-16 text-red-500" />;
    return <Meh className="w-16 h-16 text-yellow-500" />;
  };

  const getSentimentColor = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes('positive')) return 'bg-green-100 text-green-700';
    if (s.includes('negative')) return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Market Sentiment Analysis</h1>
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="wheat">Wheat</option>
            <option value="rice">Rice</option>
            <option value="corn">Corn</option>
            <option value="soybean">Soybean</option>
          </select>
        </div>

        {/* Overall Sentiment */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Overall Market Sentiment</h2>
          <div className="flex items-center justify-center mb-6">
            {getSentimentIcon()}
            <div className="ml-4">
              <div className="text-4xl font-bold capitalize">{sentimentData?.overall_sentiment || 'Loading...'}</div>
              <div className="text-gray-600">Score: {sentimentData?.sentiment_score?.toFixed(2) || '0.00'}</div>
              <div className="text-sm text-gray-500">{sentimentData?.article_count || 0} news articles analyzed</div>
            </div>
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Recent News & Analysis</h2>
          </div>
          <div className="space-y-4">
            {sentimentData?.articles?.map((news: any, index: number) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{news.headline}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{news.source}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(news.published_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(news.sentiment)}`}>
                    {news.sentiment}
                  </span>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-8">No recent articles found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
