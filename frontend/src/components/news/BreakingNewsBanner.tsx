import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Zap } from 'lucide-react';

interface BreakingArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
}

interface BreakingNewsBannerProps {
  article: BreakingArticle | null;
  onDismiss?: () => void;
}

export default function BreakingNewsBanner({ article, onDismiss }: BreakingNewsBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!article || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
          Breaking
        </span>
        <Link
          to={`/${article.slug}`}
          className="font-bold hover:text-red-100 transition-colors truncate flex-1"
        >
          {article.title}
        </Link>
        <button onClick={handleDismiss} className="shrink-0 p-0.5 hover:bg-red-700 rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
