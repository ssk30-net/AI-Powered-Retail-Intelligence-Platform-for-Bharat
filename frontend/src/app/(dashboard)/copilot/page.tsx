'use client';

import { useState } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { copilotAPI } from '@/lib/api';

export default function CopilotPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Market Assistant. Ask me anything about commodity prices, market trends, or forecasts.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call real AI backend
      const response = await copilotAPI.chat(input);
      
      const aiResponse = {
        role: 'assistant',
        content: response.response,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling copilot API:', error);
      const errorResponse = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Copilot</h1>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-blue-500 ml-2' : 'bg-gray-300 mr-2'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-gray-700" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Ask me anything about the market..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Suggested Questions:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'What is the wheat price forecast?',
              'Show me market sentiment for rice',
              'What factors affect commodity prices?',
              'Analyze price trends for the last month',
            ].map((question) => (
              <button
                key={question}
                onClick={() => setInput(question)}
                className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
