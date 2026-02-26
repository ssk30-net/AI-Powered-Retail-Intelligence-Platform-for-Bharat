import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentIndicatorProps {
  label: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}

export function SentimentIndicator({ label, sentiment, score }: SentimentIndicatorProps) {
  const config = {
    positive: {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: TrendingUp,
    },
    negative: {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: TrendingDown,
    },
    neutral: {
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: Minus,
    },
  };

  const { color, bg, border, icon: Icon } = config[sentiment];

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${border} ${bg}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className={`text-xs ${color} font-medium capitalize`}>{sentiment}</p>
        </div>
      </div>
      <div className={`text-lg font-semibold ${color}`}>{score}</div>
    </div>
  );
}
