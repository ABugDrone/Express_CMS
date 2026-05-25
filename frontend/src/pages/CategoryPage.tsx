import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import PageNav from '../components/ui/PageNav';
import Sidebar from '../components/layout/Sidebar';
import { motion } from 'motion/react';
import { Calendar, User } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { apiGetArticles, ApiArticle } from '../lib/api';
import { useThemeComponents, useThemeLayout } from '../themes/useTheme';
import { getArticleUrl } from '../lib/urls';
import SeoHead from '../components/seo/SeoHead';
import Breadcrumbs from '../components/ui/Breadcrumbs';

const SLUG_TO_CATEGORY: Record<string, string> = {
  'news':          'News',
  'politics':      'Politics',
  'opinion':       'Opinion',
  'business':      'Business',
  'health':        'Health',
  'agri-environ':  'Agri & Environ',
  'education':     'Education',
  'entertainment': 'Entertainment',
  'technology':    'Technology',
  'sports':        'Sports',
  'life':          'Life',
};

function articleToNewsItem(a: ApiArticle) {
  return {
    id: String(a.id),
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    category: a.category,
    author: a.author,
    date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    createdAt: a.created_at,
    imageUrl: a.image_url || 'https://picsum.photos/seed/news/800/400',
    videoUrl: a.video_url || undefined,
    driveUrl: a.drive_url || undefined,
    isFeatured: Boolean(a.is_featured),
    isBreaking: Boolean(a.is_breaking),
    tags: Array.isArray(a.tags) ? a.tags : [],
  };
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { news } = useAppContext();
  const navigate = useNavigate();
  const newsRef = useRef(news);
  newsRef.current = news;

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryName = SLUG_TO_CATEGORY[slug ?? ''] ?? slug ?? '';
  const components = useThemeComponents();
  const layout = useThemeLayout();
  const hasSidebar = components?.sidebar?.position !== 'none';
  const gridCols = layout?.gridColumns || 3;

  useEffect(() => {
    setLoading(true);
    const currentNews = newsRef.current;
    apiGetArticles({ category: categoryName, per_page: 50 })
      .then(res => {
        setArticles(res.items.map(articleToNewsItem));
      })
      .catch(() => {
        const fallback = currentNews.filter(n =>
          n.category.toLowerCase() === categoryName.toLowerCase() ||
          (n as any).categories?.some((c: string) => c.toLowerCase() === categoryName.toLowerCase())
        );
        setArticles(fallback);
      })
      .finally(() => setLoading(false));
  }, [categoryName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background, #ffffff)', color: 'var(--color-text, #111827)' }}
    >
      <SeoHead title={categoryName} description={`Latest ${categoryName} news and updates`} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <PageNav label={categoryName} />
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: categoryName },
        ]} />

        <div className="border-b-2 border-amber-600 pb-4 mb-8">
          <span className="inline-block bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 mb-2">
            Section
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            {categoryName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {loading ? 'Loading...' : `${articles.length} article${articles.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-8 ${hasSidebar ? 'lg:grid-cols-12' : ''}`}>
          <main className={hasSidebar ? 'lg:col-span-9' : ''}>
            {loading && articles.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4"></div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                  No articles yet
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nothing published in {categoryName} yet. Check back soon.
                </p>
              </div>
            ) : (
              <>
                {articles[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate(getArticleUrl(articles[0]))}
                    className="cursor-pointer group mb-8 pb-8 border-b border-gray-100 dark:border-white/5"
                  >
                    <div className="aspect-[16/7] overflow-hidden bg-gray-100 dark:bg-white/5 mb-4">
                      <img
                        src={articles[0].imageUrl}
                        alt={articles[0].title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                        {articles[0].category}
                      </span>
                      {articles[0].isBreaking && (
                        <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          Breaking
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors leading-tight mb-2">
                      {articles[0].title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
                      {articles[0].excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {articles[0].author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {articles[0].date}
                      </span>
                    </div>
                  </motion.div>
                )}

                {articles.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    style={gridCols > 2 ? { gridTemplateColumns: `repeat(${gridCols}, 1fr)` } : undefined}>
                    {articles.slice(1).map((article, i) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => navigate(getArticleUrl(article))}
                        className="cursor-pointer group flex flex-col"
                      >
                        <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-white/5 mb-3">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5">
                            {article.category}
                          </span>
                          {article.isBreaking && (
                            <span className="text-[9px] font-black uppercase text-red-500 flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                              Breaking
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors leading-snug mb-1 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2 flex-1">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-auto">
                          <span>{article.author}</span>
                          <span>·</span>
                          <span>{article.date}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>

          {hasSidebar && (
            <aside className="lg:col-span-3">
              <div className="sticky top-24">
                <Sidebar />
              </div>
            </aside>
          )}
        </div>
      </div>
    </motion.div>
  );
}
