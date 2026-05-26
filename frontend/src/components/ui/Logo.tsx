import { Globe, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { memo } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

const Logo = memo(function Logo({ className, variant = 'dark' }: LogoProps) {
  const isBrandDark = variant === 'dark';
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23d97706"/><text x="50" y="68" font-family="Arial Black,sans-serif" font-size="48" font-weight="900" text-anchor="middle" fill="%23ffffff">JM</text></svg>`;
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
          isBrandDark ? "text-gray-900 dark:text-white" : "text-white"
        )}>
          JM <span className="text-amber-600">NEWS</span>
        </h1>
        <span className={cn(
          "text-[9px] uppercase font-bold tracking-[0.3em] mt-0.5 whitespace-nowrap",
          isBrandDark ? "text-gray-500 dark:text-gray-400" : "text-white/60"
        )}>
          Factual & Timely News
        </span>
      </div>
    </Link>
  );
});

export default Logo;
