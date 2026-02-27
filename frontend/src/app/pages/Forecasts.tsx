import { Brain, TrendingUp, Calendar, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

const forecastData = [
  { date: 'Feb 15', actual: 4200, predicted: null, confidence: null },
  { date: 'Feb 22', actual: 4350, predicted: null, confidence: null },
  { date: 'Mar 1', actual: 4280, predicted: null, confidence: null },
  { date: 'Mar 8', actual: 4420, predicted: null, confidence: null },
  { date: 'Mar 15', actual: 4580, predicted: null, confidence: null },
  { date: 'Mar 22', actual: 4650, predicted: 4640, confidence: 92 },
  { date: 'Mar 29', actual: null, predicted: 4780, confidence: 89 },
  { date: 'Apr 5', actual: null, predicted: 4920, confidence: 85 },
  { date: 'Apr 12', actual: null, predicted: 5050, confidence: 81 },
  { date: 'Apr 19', actual: null, predicted: 5180, confidence: 77 },
  { date: 'Apr 26', actual: null, predicted: 5290, confidence: 72 },
];

const predictions = [
  {
    market: 'S&P 500',
    current: '4,783.45',
    prediction: '5,290.00',
    change: 10.6,
    confidence: 72,
    timeframe: '30 days',
    sentiment: 'bullish',
  },
  {
    market: 'NASDAQ',
    current: '15,011.35',
    prediction: '15,850.00',
    change: 5.6,
    confidence: 78,
    timeframe: '30 days',
    sentiment: 'bullish',
  },
  {
    market: 'Bitcoin',
    current: '51,234.67',
    prediction: '58,500.00',
    change: 14.2,
    confidence: 65,
    timeframe: '30 days',
    sentiment: 'bullish',
  },
  {
    market: 'Ethereum',
    current: '2,945.32',
    prediction: '3,420.00',
    change: 16.1,
    confidence: 68,
    timeframe: '30 days',
    sentiment: 'bullish',
  },
];

const keyDrivers = [
  { factor: 'Federal Reserve Policy', impact: 85, direction: 'positive' },
  { factor: 'Corporate Earnings', impact: 78, direction: 'positive' },
  { factor: 'Inflation Data', impact: 65, direction: 'neutral' },
  { factor: 'Geopolitical Events', impact: 42, direction: 'negative' },
  { factor: 'Tech Innovation', impact: 72, direction: 'positive' },
];

export function Forecasts() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">AI Price Forecasting</h1>
        <p className="text-gray-600">Machine learning powered market predictions and trend analysis</p>
      </div>

      {/* AI Forecast Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">S&P 500 AI Forecast Model</h3>
            </div>
            <p className="text-sm text-gray-600">30-day prediction with confidence intervals</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              Actual
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              Predicted
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <ReferenceLine
              x="Mar 22"
              stroke="#6b7280"
              strokeDasharray="3 3"
              label={{ value: 'Today', position: 'top' }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', r: 5 }}
              name="Actual Price"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#9333ea"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#9333ea', r: 5 }}
              name="AI Prediction"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {predictions.map((pred, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{pred.market}</h3>
                <p className="text-sm text-gray-600">Current: {pred.current}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 capitalize">
                  {pred.sentiment}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Predicted Price</p>
                <p className="text-xl font-semibold text-purple-700">{pred.prediction}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Expected Change</p>
                <p className="text-xl font-semibold text-blue-700">+{pred.change}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{pred.timeframe}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Confidence: {pred.confidence}%</span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-3">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  style={{ width: `${pred.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Drivers */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Key Market Drivers</h3>
          <p className="text-sm text-gray-600">Factors influencing our AI predictions</p>
        </div>
        <div className="space-y-4">
          {keyDrivers.map((driver, idx) => {
            const directionConfig = {
              positive: { color: 'text-green-600', bg: 'bg-green-600' },
              neutral: { color: 'text-yellow-600', bg: 'bg-yellow-600' },
              negative: { color: 'text-red-600', bg: 'bg-red-600' },
            } as const;
            const config = directionConfig[driver.direction as keyof typeof directionConfig];

            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{driver.factor}</span>
                    <span className={`text-sm font-medium ${config.color} capitalize`}>
                      {driver.direction}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${config.bg} rounded-full transition-all`}
                      style={{ width: `${driver.impact}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600 w-12 text-right">
                  {driver.impact}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
