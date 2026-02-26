// Concept 2: Modern Pulse Line + Upward Market Trend Arrow

interface LogoProps {
  variant?: 'full' | 'icon' | 'monochrome';
  size?: number;
}

export function LogoConcept2({ variant = 'full', size = 40 }: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="url(#gradient2)" />
        <path
          d="M10 28 L14 28 L17 22 L20 34 L23 18 L26 28 L29 24 L38 24"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M32 18 L38 24 L32 24 Z"
          fill="#FF7A00"
        />
        <defs>
          <linearGradient id="gradient2" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#1F3C88" />
            <stop offset="100%" stopColor="#00A8A8" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (variant === 'monochrome') {
    return (
      <div className="flex items-center gap-3">
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="#1F3C88" />
          <path
            d="M10 28 L14 28 L17 22 L20 34 L23 18 L26 28 L29 24 L38 24"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M32 18 L38 24 L32 24 Z"
            fill="white"
          />
        </svg>
        <span className="text-2xl font-bold text-gray-900">AI Market Pulse</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="url(#gradient2-full)" />
        <path
          d="M10 28 L14 28 L17 22 L20 34 L23 18 L26 28 L29 24 L38 24"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M32 18 L38 24 L32 24 Z"
          fill="#FF7A00"
        />
        <defs>
          <linearGradient id="gradient2-full" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#1F3C88" />
            <stop offset="100%" stopColor="#00A8A8" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <span className="text-2xl font-bold bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] bg-clip-text text-transparent">
          AI Market Pulse
        </span>
      </div>
    </div>
  );
}
