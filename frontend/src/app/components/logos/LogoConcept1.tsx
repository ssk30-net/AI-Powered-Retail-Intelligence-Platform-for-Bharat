// Concept 1: Minimal AI + Data Graph Fusion Symbol

interface LogoProps {
  variant?: 'full' | 'icon' | 'monochrome';
  size?: number;
}

export function LogoConcept1({ variant = 'full', size = 40 }: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="url(#gradient1)" />
        <path
          d="M14 28L20 22L26 26L34 18"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="34" cy="18" r="2" fill="white" />
        <circle cx="26" cy="26" r="2" fill="white" />
        <circle cx="20" cy="22" r="2" fill="white" />
        <circle cx="14" cy="28" r="2" fill="white" />
        <path
          d="M30 32C30 32 32 30 34 30C36 30 38 32 38 32"
          stroke="#FF7A00"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient1" x1="0" y1="0" x2="48" y2="48">
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
            d="M14 28L20 22L26 26L34 18"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="34" cy="18" r="2" fill="white" />
          <circle cx="26" cy="26" r="2" fill="white" />
          <circle cx="20" cy="22" r="2" fill="white" />
          <circle cx="14" cy="28" r="2" fill="white" />
        </svg>
        <span className="text-2xl font-bold text-gray-900">AI Market Pulse</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="url(#gradient1-full)" />
        <path
          d="M14 28L20 22L26 26L34 18"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="34" cy="18" r="2" fill="white" />
        <circle cx="26" cy="26" r="2" fill="white" />
        <circle cx="20" cy="22" r="2" fill="white" />
        <circle cx="14" cy="28" r="2" fill="white" />
        <path
          d="M30 32C30 32 32 30 34 30C36 30 38 32 38 32"
          stroke="#FF7A00"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient1-full" x1="0" y1="0" x2="48" y2="48">
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
