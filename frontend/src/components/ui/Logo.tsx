import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { memo } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

const Logo = memo(function Logo({ className, variant = 'dark' }: LogoProps) {
  const isBrandDark = variant === 'dark';
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23D97706" stroke="%23DC2626" stroke-width="4"/><text x="50" y="58" font-family="Arial Black,sans-serif" font-size="36" font-weight="900" text-anchor="middle" fill="%23111827">JM</text></svg>`;
  const logoUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;

  return (
    <Link to="/" className={cn("flex items-center gap-3 select-none cursor-pointer group/logo", className)}>
      <div className="relative w-12 h-12 md:w-14 md:h-14 overflow-hidden rounded-full border-2 border-amber-600 shadow-md group-hover/logo:scale-110 transition-transform duration-300 shrink-0">
        <img
          src={logoUrl}
          alt="JM News Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = logoUrl; }}
        />
      </div>

      <div className="flex flex-col">
        <h1 className={cn(
          "text-xl md:text-2xl font-black tracking-tight leading-none transition-all duration-300",
          isBrandDark ? "text-white" : "text-gray-900"
        )}
        style={{ color: isBrandDark ? '#ffffff' : '#111827' }}>
          JM <span className="text-amber-600">NEWS</span>
        </h1>
        <span className={cn(
          "text-[9px] uppercase font-bold tracking-[0.3em] mt-0.5 whitespace-nowrap",
          isBrandDark ? "text-white/60" : "text-gray-500"
        )}
        style={{ color: isBrandDark ? 'rgba(255,255,255,0.6)' : '#6b7280' }}>
          Factual & Timely News
        </span>
      </div>
    </Link>
  );
});

export default Logo;
