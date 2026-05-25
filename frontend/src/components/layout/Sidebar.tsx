import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import RssWire from '../ui/RssWire';
import { useMemo, memo, useState, useEffect } from 'react';
import { apiGetActiveNewsTypes } from '../../lib/api';
import { useThemeComponents } from '../../themes/useTheme';
import { getArticleUrl } from '../../lib/urls';

function Sidebar() {
  const { news } = useAppContext();
  const components = useThemeComponents();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    apiGetActiveNewsTypes().then(types => {
      setCategories(types.map(t => ({ name: t.name, slug: t.slug })));
    }).catch(() => {});
  }, []);

  const breakingNews = useMemo(() => news.filter(n => n.isBreaking).slice(0, 3), [news]);

  if (components?.sidebar?.position === 'none') return null;

  const trending = useMemo(() => [...news]
    .sort((a, b) => {
      const va = (a as any).views ?? 0;
      const vb = (b as any).views ?? 0;
      if (vb !== va) return vb - va;
      const da = new Date(a.date).getTime() || 0;
      const db = new Date(b.date).getTime() || 0;
      return db - da;
    })
    .slice(0, 5), [news]);

  return (
    <aside className="w-full flex flex-col gap-3">

      {/* Breaking News */}
      {breakingNews.length > 0 && (
        <section className="bg-white dark:bg-vibrant-primary/5 border border-vibrant-accent/20 dark:border-vibrant-accent/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-vibrant-accent rounded-full animate-pulse" />
            <h4 className="text-xs font-black uppercase tracking-widest text-vibrant-accent">
              🔴 Breaking
            </h4>
          </div>
          <div className="flex flex-col gap-2">
            {breakingNews.map(story => (
              <button
                key={story.id}
                onClick={() => navigate(getArticleUrl(story))}
                className="group text-left flex gap-2 items-start p-1 hover:bg-vibrant-accent/5 dark:hover:bg-vibrant-accent/10 rounded transition-colors"
              >
                <div className="w-6 h-6 shrink-0 bg-vibrant-accent/15 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-vibrant-accent rounded-full animate-pulse" />
                </div>
                <p className="text-xs font-bold leading-snug group-hover:text-vibrant-accent transition-colors line-clamp-2 text-vibrant-text dark:text-vibrant-text">
                  {story.title}
                </p>
              </button>
            ))}
          </div>
          </section>
        )}

      {/* Trending — real articles sorted by views */}
      {trending.length > 0 && (
        <section className="bg-white dark:bg-vibrant-primary/5 border border-vibrant-primary/10 dark:border-vibrant-primary/20 p-3 rounded-lg">
          <h4 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2 text-vibrant-text">
            <span className="w-1.5 h-2 bg-vibrant-primary rounded-full" />
            📈 Trending
          </h4>
          <div className="flex flex-col gap-2">
            {trending.map((story, i) => (
              <button
                key={story.id}
                onClick={() => navigate(getArticleUrl(story))}
                className="group text-left flex gap-2 items-start"
              >
                <div className="w-5 h-5 shrink-0 bg-vibrant-primary/10 dark:bg-vibrant-primary/15 rounded flex items-center justify-center text-vibrant-primary font-black text-[9px] group-hover:bg-vibrant-primary group-hover:text-white transition-all">
                  {i + 1}
                </div>
                <p className="text-xs font-bold leading-snug group-hover:text-vibrant-primary transition-colors line-clamp-2 text-vibrant-text dark:text-vibrant-text">
                  {story.title}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* News Wire — live RSS from Punch & Daily Trust */}
      <RssWire />

      {/* Newsletter */}
      <section id="subscribe" className="bg-gradient-to-br from-vibrant-primary to-vibrant-primary-dark p-3 rounded-lg shadow-lg text-white scroll-mt-24">
        <h4 className="text-sm font-black tracking-tight mb-1">JM Brief</h4>
        <p className="text-xs text-white/80 leading-relaxed mb-2">
          Daily news to your inbox.
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="https://whatsapp.com/channel/0029VbAvBF50lwgzHxehLm3l"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-green-500 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-md group"
          >
            <div className="w-4 h-4 overflow-hidden rounded-full shadow-inner bg-white/20">
              <img
                src="https://www.kampalaedgetimes.com/wp-content/uploads/2025/03/images-2025-03-28T132941.670.jpeg"
                alt="WhatsApp"
                className="w-full h-full object-cover scale-150 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
            WhatsApp
          </a>
          <div className="flex flex-col gap-1">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all"
            />
            <button
              onClick={() => alert('Newsletter signup coming soon!')}
              className="w-full py-1 bg-white text-vibrant-primary text-xs font-black uppercase tracking-widest rounded-lg hover:bg-vibrant-accent hover:text-white transition-all transform active:scale-95 shadow-md"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Paper Edition */}
      <section id="paper-edition" className="bg-white dark:bg-vibrant-primary/5 border border-vibrant-primary/10 dark:border-vibrant-primary/20 p-3 rounded-lg scroll-mt-24">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 shadow-md border border-gray-300 dark:border-gray-600 transform -rotate-3 hover:rotate-0 transition-transform mb-2 flex flex-col p-1 overflow-hidden rounded text-[8px]">
            <div className="w-full h-0.5 bg-vibrant-primary mb-0.5" />
            <div className="w-full h-0.5 bg-gray-400 mb-0.5" />
            <div className="w-full h-0.5 bg-gray-300 mb-0.5" />
            <div className="flex-grow bg-gray-100 dark:bg-gray-600 mt-1" />
          </div>
          <h4 className="text-xs font-black text-vibrant-text dark:text-vibrant-text uppercase tracking-tight mb-1">Paper</h4>
          <p className="text-vibrant-text-light dark:text-vibrant-text-light/70 text-[9px] leading-relaxed mb-2 font-medium uppercase tracking-widest">PDF</p>
          <a
            href="https://www.facebook.com/profile.php?id=61554997846277"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1 bg-vibrant-text dark:bg-vibrant-primary text-white text-[9px] text-center font-black uppercase tracking-[0.15em] rounded-lg hover:bg-vibrant-primary dark:hover:bg-vibrant-primary-dark transition-colors"
          >
            Download
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-gray-200 dark:border-white/10 pt-2">
        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] mb-2 text-vibrant-text-light dark:text-vibrant-text-light/60">
          Categories
        </h4>
        <div className="flex flex-wrap gap-1">
          {categories.map(({ name, slug }) => (
            <Link
              key={slug}
              to={`/category/${slug}`}
              className="px-2 py-0.5 border border-gray-200 dark:border-white/10 text-[8px] font-bold uppercase tracking-wider hover:bg-vibrant-primary hover:text-white hover:border-vibrant-primary transition-all rounded text-vibrant-text dark:text-vibrant-text"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>

    </aside>
  );
}

export default memo(Sidebar);
