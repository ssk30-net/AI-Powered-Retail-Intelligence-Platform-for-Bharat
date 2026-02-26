import { Bot, Send, Sparkles, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { useState } from 'react';

export function AICopilot() {
  const [message, setMessage] = useState('');

  const suggestedQuestions = [
    'What are the key market trends for next quarter?',
    'Analyze the current price volatility',
    'Show me sentiment breakdown by region',
    'Compare forecast accuracy over time',
  ];

  const insights = [
    {
      title: 'Price Trend Alert',
      description: 'Commodity prices showing upward momentum',
      type: 'trend',
    },
    {
      title: 'Risk Assessment',
      description: 'Medium volatility expected in Q2',
      type: 'risk',
    },
    {
      title: 'Forecast Update',
      description: 'New prediction model deployed',
      type: 'update',
    },
  ];

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-8 h-8 text-gray-900 dark:text-gray-100" />
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">AI Market Copilot</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Your intelligent market analysis assistant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col h-[700px]">
          {/* Chat Header */}
          <div className="p-4 border-b-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 dark:bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Online • Ready to help</p>
              </div>
            </div>
          </div>

          {/* Suggested Questions */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Suggested Questions
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  className="px-3 py-2 text-left text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* AI Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-800 dark:bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white dark:text-gray-900" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-5/6 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-4/6 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="flex-1 max-w-md">
                  <div className="bg-gray-800 dark:bg-gray-200 rounded-lg p-4 ml-auto">
                    <div className="space-y-2">
                      <div className="w-3/4 h-3 bg-gray-700 dark:bg-gray-300 rounded ml-auto"></div>
                      <div className="w-full h-3 bg-gray-700 dark:bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Response with Chart */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-800 dark:bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white dark:text-gray-900" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="space-y-2 mb-3">
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-4/6 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <p className="text-xs text-gray-500 dark:text-gray-500">Chart Placeholder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about market trends..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
              />
              <button className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Insights & Recommendations */}
        <div className="space-y-6">
          {/* Insight Cards */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Insights</h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {insight.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recommendations</h3>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-4/5 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-3/5 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors">
                Generate Report
              </button>
              <button className="w-full px-4 py-2 text-left text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors">
                Export Analysis
              </button>
              <button className="w-full px-4 py-2 text-left text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors">
                Schedule Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
