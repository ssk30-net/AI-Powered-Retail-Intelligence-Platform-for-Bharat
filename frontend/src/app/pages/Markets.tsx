import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const markets = [
  {
    name: 'S&P 500',
    symbol: 'SPX',
    price: '4,783.45',
    change: 1.24,
    changePercent: 2.67,
    data: [4200, 4350, 4280, 4420, 4580, 4650, 4783],
  },
  {
    name: 'NASDAQ',
    symbol: 'IXIC',
    price: '15,011.35',
    change: 243.56,
    changePercent: 1.65,
    data: [14200, 14450, 14380, 14620, 14780, 14850, 15011],
  },
  {
    name: 'Dow Jones',
    symbol: 'DJI',
    price: '37,863.80',
    change: -124.32,
    changePercent: -0.33,
    data: [37200, 37450, 37380, 37620, 37980, 38050, 37864],
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC-USD',
    price: '51,234.67',
    change: 1834.23,
    changePercent: 3.71,
    data: [45200, 46450, 47380, 48620, 49780, 50150, 51235],
  },
  {
    name: 'Ethereum',
    symbol: 'ETH-USD',
    price: '2,945.32',
    change: 87.45,
    changePercent: 3.06,
    data: [2500, 2620, 2580, 2720, 2850, 2890, 2945],
  },
  {
    name: 'Gold',
    symbol: 'GC=F',
    price: '2,045.80',
    change: -12.40,
    changePercent: -0.60,
    data: [2020, 2035, 2040, 2055, 2060, 2058, 2046],
  },
  {
    name: 'Crude Oil',
    symbol: 'CL=F',
    price: '78.34',
    change: 2.15,
    changePercent: 2.82,
    data: [72, 73.5, 74, 75.2, 76.8, 77.2, 78.34],
  },
  {
    name: 'EUR/USD',
    symbol: 'EURUSD=X',
    price: '1.0847',
    change: 0.0023,
    changePercent: 0.21,
    data: [1.075, 1.078, 1.080, 1.082, 1.083, 1.084, 1.0847],
  },
];

export function Markets() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Global Markets</h1>
        <p className="text-gray-600">Real-time market data and performance tracking</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search markets, symbols, or assets..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {markets.map((market, idx) => {
          const isPositive = market.change > 0;
          const chartData = market.data.map((value, i) => ({ value, index: i }));

          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{market.name}</h3>
                  <p className="text-sm text-gray-500">{market.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-gray-900">{market.price}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}{market.changePercent}%
                    </span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isPositive ? '#10b981' : '#ef4444'}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={isPositive ? '#10b981' : '#ef4444'}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    fill={`url(#gradient-${idx})`}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">24h Change</span>
                  <span
                    className={`font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isPositive ? '+' : ''}{market.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
