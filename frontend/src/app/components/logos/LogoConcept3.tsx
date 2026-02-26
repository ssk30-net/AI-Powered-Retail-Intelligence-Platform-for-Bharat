// Concept 3: Abstract Neural Network Forming Market Chart

interface LogoProps {
  variant?: 'full' | 'icon' | 'monochrome';
  size?: number;
}

export function LogoConcept3({ variant = 'full', size = 40 }: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="url(#gradient3)" />
        {/* Neural network nodes */}
        <circle cx="12" cy="30" r="2.5" fill="white" opacity="0.8" />
        <circle cx="18" cy="24" r="2.5" fill="white" />
        <circle cx="24" cy="20" r="2.5" fill="white" />
        <circle cx="30" cy="16" r="2.5" fill="white" />
        <circle cx="36" cy="12" r="2.5" fill="#FF7A00" />
        
        {/* Connections */}
        <path d="M12 30 L18 24" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <path d="M18 24 L24 20" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <path d="M24 20 L30 16" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <path d="M30 16 L36 12" stroke="#FF7A00" strokeWidth="2" />
        
        {/* Secondary nodes */}
        <circle cx="15" cy="26" r="1.5" fill="white" opacity="0.4" />
        <circle cx="21" cy="22" r="1.5" fill="white" opacity="0.4" />
        <circle cx="27" cy="18" r="1.5" fill="white" opacity="0.4" />
        <circle cx="33" cy="14" r="1.5" fill="#FF7A00" opacity="0.6" />
        
        <defs>
          <linearGradient id="gradient3" x1="0" y1="0" x2="48" y2="48">
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
          <circle cx="12" cy="30" r="2.5" fill="white" opacity="0.8" />
          <circle cx="18" cy="24" r="2.5" fill="white" />
          <circle cx="24" cy="20" r="2.5" fill="white" />
          <circle cx="30" cy="16" r="2.5" fill="white" />
          <circle cx="36" cy="12" r="2.5" fill="white" />
          <path d="M12 30 L18 24" stroke="white" strokeWidth="1.5" opacity="0.5" />
          <path d="M18 24 L24 20" stroke="white" strokeWidth="1.5" opacity="0.5" />
          <path d="M24 20 L30 16" stroke="white" strokeWidth="1.5" opacity="0.5" />
          <path d="M30 16 L36 12" stroke="white" strokeWidth="2" />
          <circle cx="15" cy="26" r="1.5" fill="white" opacity="0.4" />
          <circle cx="21" cy="22" r="1.5" fill="white" opacity="0.4" />
          <circle cx="27" cy="18" r="1.5" fill="white" opacity="0.4" />
          <circle cx="33" cy="14" r="1.5" fill="white" opacity="0.6" />
        </svg>
        <span className="text-2xl font-bold text-gray-900">AI Market Pulse</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="url(#gradient3-full)" />
        <circle cx="12" cy="30" r="2.5" fill="white" opacity="0.8" />
        <circle cx="18" cy="24" r="2.5" fill="white" />
        <circle cx="24" cy="20" r="2.5" fill="white" />
        <circle cx="30" cy="16" r="2.5" fill="white" />
        <circle cx="36" cy="12" r="2.5" fill="#FF7A00" />
        <path d="M12 30 L18 24" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <path d="M18 24 L24 20" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <path d="M24 20 L30 16" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <path d="M30 16 L36 12" stroke="#FF7A00" strokeWidth="2" />
        <circle cx="15" cy="26" r="1.5" fill="white" opacity="0.4" />
        <circle cx="21" cy="22" r="1.5" fill="white" opacity="0.4" />
        <circle cx="27" cy="18" r="1.5" fill="white" opacity="0.4" />
        <circle cx="33" cy="14" r="1.5" fill="#FF7A00" opacity="0.6" />
        <defs>
          <linearGradient id="gradient3-full" x1="0" y1="0" x2="48" y2="48">
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
