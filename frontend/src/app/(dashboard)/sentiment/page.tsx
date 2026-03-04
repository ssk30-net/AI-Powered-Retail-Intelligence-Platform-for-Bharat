'use client';

import { useEffect, useState } from 'react';
import { Smile, Meh, Frown, MessageSquare, Loader, Upload } from 'lucide-react';
import Link from 'next/link';
import { insightsAPI } from '@/lib/api';

type CommodityOption = { id: number; name: string };

export default function SentimentPage() {
  const [commodities, setCommodities] = useState<CommodityOption[]>([]);
  const [dataSource, setDataSource] = useState<string>('platform_data');
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCommodities, setLoadingCommodities] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');

  useEffect(() => {
    (async () => {
      setLoadingCommodities(true);
      try {
        const { commodities: list, data_source } = await insightsAPI.getSentimentCommodities();
        setCommodities(list);
        setDataSource(data_source);
        if (list.length > 0 && !selectedCommodity) {
          setSelectedCommodity(list[0].name);
        } else if (list.length > 0 && !list.some((c) => c.name === selectedCommodity)) {
          setSelectedCommodity(list[0].name);
        }
      } catch (e) {
        console.error('Error loading sentiment commodities:', e);
        setCommodities([{ id: 0, name: 'wheat' }, { id: 0, name: 'rice' }, { id: 0, name: 'corn' }]);
        if (!selectedCommodity) setSelectedCommodity('wheat');
      } finally {
        setLoadingCommodities(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCommodity) return;
    loadSentimentData();
  }, [selectedCommodity]);

  const loadSentimentData = async () => {
    if (!selectedCommodity) return;
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

  const isUserData = dataSource === 'your_uploaded_data';

  if (loadingCommodities) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (commodities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto text-center py-16">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Market Sentiment Analysis</h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Upload price data to see sentiment and news for your commodities. We’ll show sentiment only for the products you track.
          </p>
          <Link
            href="/ingest"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Upload className="w-4 h-4" />
            Upload data
          </Link>
        </div>
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
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Market Sentiment Analysis</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isUserData ? 'Based on your uploaded data' : 'Based on platform data'}
              {sentimentData?.data_source_note ? ` · ${sentimentData.data_source_note}` : ''}
            </p>
          </div>
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {commodities.map((c) => (
              <option key={c.id + '-' + c.name} value={c.name}>
                {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {isLoading && !sentimentData ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
        {/* Overall Sentiment */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Overall Market Sentiment</h2>
          <div className="flex items-center justify-center mb-6">
            {getSentimentIcon()}
            <div className="ml-4">
              <div className="text-4xl font-bold capitalize">{sentimentData?.overall_sentiment || '—'}</div>
              <div className="text-gray-600">Score: {sentimentData?.sentiment_score?.toFixed(2) ?? '0.00'}</div>
              <div className="text-sm text-gray-500">{sentimentData?.article_count ?? 0} news articles analyzed</div>
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
          </>
        )}
      </div>
    </div>
  );
}
