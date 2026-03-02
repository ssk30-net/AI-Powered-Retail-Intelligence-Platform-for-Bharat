'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, Target, Zap, Loader, AlertTriangle } from 'lucide-react';
import { insightsAPI } from '@/lib/api';

export default function InsightsPage() {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await insightsAPI.getInsights(['wheat', 'rice', 'corn']);
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI-Powered Market Insights</h1>

        {/* Opportunities */}
        {insights?.opportunities && insights.opportunities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Target className="w-6 h-6 text-green-600 mr-2" />
              Opportunities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.opportunities.map((opp: any, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-semibold">{opp.title}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {opp.impact}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{opp.description}</p>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {opp.commodity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risks */}
        {insights?.risks && insights.risks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              Risks & Warnings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.risks.map((risk: any, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-red-500">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-semibold">{risk.title}</h3>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{risk.description}</p>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {risk.commodity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {insights?.recommendations && insights.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Lightbulb className="w-6 h-6 text-blue-600 mr-2" />
              AI Recommendations
            </h2>
            <div className="space-y-4">
              {insights.recommendations.map((rec: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-lg font-semibold ${
                      rec.action.toLowerCase() === 'buy' ? 'bg-green-500 text-white' :
                      rec.action.toLowerCase() === 'sell' ? 'bg-red-500 text-white' :
                      rec.action.toLowerCase() === 'hold' ? 'bg-blue-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {rec.action}
                    </span>
                    <div>
                      <div className="font-semibold">{rec.commodity}</div>
                      <div className="text-sm text-gray-600">{rec.reasoning}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{rec.confidence}%</div>
                    <div className="text-xs text-gray-500">Confidence</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!insights || ((!insights.opportunities || insights.opportunities.length === 0) &&
          (!insights.risks || insights.risks.length === 0) &&
          (!insights.recommendations || insights.recommendations.length === 0))) && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No insights available</h3>
            <p className="text-gray-500">Insights will appear here as the AI analyzes market data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
