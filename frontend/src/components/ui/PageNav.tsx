import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { memo } from 'react';

const PageNav = memo(function PageNav({ label }: { label: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#141414]">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>
      <span className="text-gray-300 dark:text-white/20">|</span>
      <Link
        to="/"
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        Home
      </Link>
      <span className="text-gray-300 dark:text-white/20">›</span>
      <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">{label}</span>
    </div>
  );
});

export default PageNav;
