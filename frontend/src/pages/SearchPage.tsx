import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X, Calendar, User } from 'lucide-react';
import { motion } from 'motion/react';
import PageNav from '../components/ui/PageNav';
import SeoHead from '../components/seo/SeoHead';
import { apiGetArticles } from '../lib/api';
import { NewsItem } from '../types';
import { getArticleUrl } from '../lib/urls';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    apiGetArticles({ search: query, limit: '50' })
      .then(data => setResults(data.items || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().length < 2) return;
    setSearchParams({ q: input.trim() });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen" style={{ backgroundColor: 'var(--color-background, #ffffff)', color: 'var(--color-text, #111827)' }}>
      <SeoHead title={query ? `Search: ${query}` : 'Search'} description={`Search results for "${query}"`} />
      <PageNav label="Search" />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex items-center gap-3 border-b-2 border-amber-600 pb-3">
            <Search className="w-5 h-5 text-amber-600 shrink-0" />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search articles..."
              className="flex-1 text-lg bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
              autoFocus
            />
            {input && (
              <button type="button" onClick={() => { setInput(''); setSearchParams({}, { replace: true }); }}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
            <button type="submit" className="px-4 py-1.5 bg-amber-600 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-colors">Search</button>
          </div>
        </form>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 text-gray-300 dark:text-gray-600">🔍</div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Results</h2>
            <p className="text-sm text-gray-500">No articles found for "{query}". Try different keywords.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
            <div className="space-y-4">
              {results.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(getArticleUrl(article))}
                  className="flex gap-4 p-4 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-amber-600/50 transition-colors group bg-white dark:bg-white/5"
                >
                  <div className="w-20 h-20 shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-white/10">
                    <img src={article.imageUrl} alt="" referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black uppercase text-amber-600 tracking-widest">{article.category}</span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors line-clamp-2 mt-0.5">{article.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">{article.excerpt}</p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-2">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
