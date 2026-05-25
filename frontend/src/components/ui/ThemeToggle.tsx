import { Moon, Sun } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { memo } from 'react';

const ThemeToggle = memo(function ThemeToggle() {
  const { theme, toggleTheme } = useAppContext();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all group relative overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5">
        <Sun className={`w-5 h-5 text-vibrant-accent transition-all duration-500 absolute inset-0 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
        <Moon className={`w-5 h-5 text-vibrant-primary transition-all duration-500 absolute inset-0 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
      </div>
    </button>
  );
});

export default ThemeToggle;
