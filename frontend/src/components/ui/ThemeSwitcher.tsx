import { useState, useEffect, useRef } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../../themes/useTheme';
import { Theme } from '../../themes/themeTypes';

export default function ThemeSwitcher() {
  const { theme: activeTheme, applyTheme } = useTheme();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/themes')
      .then(r => r.json())
      .then(d => setThemes(d.themes || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (themes.length < 2) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-gray-400"
        title="Switch Theme"
      >
        <Palette className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-amber-600/20 shadow-xl rounded-lg z-50 max-h-72 overflow-y-auto">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => { applyTheme(t.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-amber-50 dark:hover:bg-amber-600/10 transition-colors ${
                t.isActive ? 'text-amber-600 font-bold' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="w-4 h-4 rounded-full border border-current shrink-0" style={{ backgroundColor: t.colors?.primary || '#d97706' }} />
              <span className="flex-1 truncate">{t.name}</span>
              {t.isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
