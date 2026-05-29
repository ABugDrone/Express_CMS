import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, Newspaper, Megaphone, MessageSquare, Users, Settings,
  LogOut, Plus, Edit2, Trash2, Star, Zap, ShieldBan,
  ShieldCheck, Search, X, Save, UserPlus,
  AlertTriangle, CheckCircle, Unlock, Lock,
  RefreshCw, Moon, Sun, Menu, User, Twitter, Linkedin, Camera,
  BarChart2, TrendingUp, Eye, EyeOff, Home, Palette, Globe, Share2, List, Smartphone, Layout, Image as ImageIcon,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { NewsItem, Advertisement } from '../types';
import AdminCreatePost from '../components/admin/AdminCreatePost';
import AdminManageAds from '../components/admin/AdminManageAds';
import AdminBranding from '../components/admin/AdminBranding';
import AdminSocials from '../components/admin/AdminSocials';
import AdminNewsTypes from '../components/admin/AdminNewsTypes';
import AdminQuickLinks from '../components/admin/AdminQuickLinks';
import AdminCTAs from '../components/admin/AdminCTAs';
import AdminPageElements from '../components/admin/AdminPageElements';
import MediaInput from '../components/ui/MediaInput';
import {
  apiGetDashboard, apiGetComments, apiUpdateComment, apiDeleteComment,
  apiGetStaff, apiCreateStaff, apiUpdateStaff, apiDeleteStaff,
  apiGetSettings, apiUpdateSettings, apiBanUser, apiUnbanUser,
} from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'news' | 'ads' | 'comments' | 'staff' | 'profile' | 'settings' | 'branding' | 'socials' | 'news-types' | 'quick-links' | 'ctas' | 'page-elements';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  editor:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  reporter:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  moderator: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

// ─── Login Screen — "Secure Authentication / Authorize" style ────────────────

function LoginScreen() {
  const { login } = useAppContext();
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      const ok = await login(password);
      if (!ok) {
        setError(true);
        setPassword('');
        setTimeout(() => setError(false), 2500);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center text-center"
      >
        {/* Shield icon */}
        <motion.div
          animate={error ? { rotate: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <ShieldCheck
            className={`w-14 h-14 mb-6 transition-colors duration-300 ${
              error ? 'text-red-500' : 'text-vibrant-primary'
            }`}
          />
        </motion.div>

        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
          Secure Authentication
        </h3>
        <p className="text-white/40 text-sm mb-8">
          Access the JM News management console.
        </p>

        {/* Password input */}
        <input
          autoFocus
          required
          type="password"
          placeholder="Enter secure key..."
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-center text-white placeholder:text-white/20 focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-red-500/60 focus:ring-red-500'
              : 'border-white/10 focus:ring-vibrant-primary'
          }`}
        />

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-xs font-black uppercase tracking-widest mt-4"
            >
              Invalid Access Key
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex gap-4 mt-10">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-white/40 font-bold text-sm px-6 py-2 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-vibrant-primary text-white font-black uppercase tracking-widest px-8 py-3 rounded-full shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {loading ? 'Authorizing...' : 'Authorize'}
          </button>
        </div>

        <Link to="/"
          className="mt-8 text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white/60 transition-colors"
        >
          ← Back to Homepage
        </Link>
      </motion.form>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: number | string; icon: React.ElementType;
  color: string; sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-black text-vibrant-text dark:text-white">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  const { news, ads, bannedUserIds } = useAppContext();
  const [stats, setStats] = useState<{
    articles: number; drafts: number; comments: number; spam_comments: number;
    ads_active: number; ads_total: number; banned_users: number;
    total_views: number; total_ad_clicks: number;
  } | null>(null);
  const [recentArticles, setRecentArticles] = useState<Array<{
    id: number; title: string; category: string; views: number; created_at: string;
  }>>([]);
  const [byCategory, setByCategory] = useState<{ name: string; count: number }[]>([]);
  const [dailyActivity, setDailyActivity] = useState<{ date: string; count: number }[]>([]);
  const [topArticles, setTopArticles] = useState<Array<{
    id: number; title: string; views: number; slug: string;
  }>>([]);
  const [articlesThisWeek, setArticlesThisWeek] = useState(0);

  useEffect(() => {
    apiGetDashboard()
      .then(data => {
        setStats(data.stats);
        setRecentArticles(data.recent_articles as typeof recentArticles);
        setByCategory(data.by_news_type?.map((nt: any) => ({ name: nt.name, count: nt.count })) ?? []);
        setDailyActivity(data.daily_activity ?? []);
        setTopArticles(data.top_articles ?? []);
        setArticlesThisWeek(data.articles_this_week ?? 0);
      })
      .catch(() => {
        // Fallback to local counts
        setStats({
          articles:       news.length,
          drafts:         0,
          comments:       0,
          spam_comments:  0,
          ads_active:     ads.filter(a => a.isActive).length,
          ads_total:      ads.length,
          banned_users:   bannedUserIds.length,
          total_views:    0,
          total_ad_clicks: 0,
        });
        const map: Record<string, number> = {};
        news.forEach(n => { map[n.category] = (map[n.category] || 0) + 1; });
        setByCategory(Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));
        setDailyActivity([]);
        setTopArticles([]);
        setArticlesThisWeek(0);
      });
  }, [news, ads, bannedUserIds]);

  const featured  = news.filter(n => n.isFeatured).length;
  const totalArt  = stats?.articles ?? news.length;
  const totalAds  = stats?.ads_active ?? ads.filter(a => a.isActive).length;
  const totalBanned = stats?.banned_users ?? bannedUserIds.length;
  const breaking  = news.filter(n => n.isBreaking).length;
  const topCats   = (byCategory ?? []).slice(0, 6);
  const totalForPct = topCats.reduce((s, c) => s + c.count, 0) || 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Articles" value={totalArt} icon={Newspaper}
          color="bg-vibrant-primary/10 text-vibrant-primary" sub={`${featured} featured`} />
        <StatCard label="Breaking News" value={breaking} icon={Zap}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" />
        <StatCard label="Active Ads" value={totalAds} icon={Megaphone}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          sub={`${stats?.ads_total ?? ads.length} total`} />
        <StatCard label="Banned Users" value={totalBanned} icon={ShieldBan}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" />
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Views" value={stats.total_views.toLocaleString()} icon={BarChart2}
            color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
          <StatCard label="Ad Clicks" value={stats.total_ad_clicks.toLocaleString()} icon={TrendingUp}
            color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
          <StatCard label="Comments" value={stats.comments} icon={MessageSquare}
            color="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
            sub={`${stats.spam_comments} spam`} />
          <StatCard label="Drafts" value={stats.drafts} icon={Newspaper}
            color="bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400" />
          <StatCard label="This Week" value={articlesThisWeek} icon={TrendingUp}
            color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white">Recent Articles</h3>
            <button onClick={() => onTabChange('news')} className="text-xs font-bold text-vibrant-primary hover:underline">View all</button>
          </div>
          <div className="flex flex-col gap-3">
            {(recentArticles.length > 0 ? recentArticles : news.slice(0, 5)).map((n: any) => (
              <div key={n.id} className="flex items-start gap-3">
                {n.imageUrl && <img src={n.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-vibrant-text dark:text-white line-clamp-1">{n.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{n.category} · {n.views !== undefined ? `${n.views} views` : n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white mb-4">By Category</h3>
          <div className="flex flex-col gap-3">
            {topCats.map(({ name, count }) => {
              const pct = Math.round((count / totalForPct) * 100);
              return (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-vibrant-text dark:text-white">{name}</span>
                    <span className="text-gray-400">{count} articles</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-vibrant-primary rounded-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Activity & Top Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dailyActivity.length > 0 && (
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white mb-4">Daily Activity (7 days)</h3>
            <div className="flex items-end gap-2 h-24">
              {dailyActivity.map(({ date, count }) => {
                const maxCount = Math.max(...dailyActivity.map(d => d.count), 1);
                const height = Math.max((count / maxCount) * 100, 4);
                const dayLabel = new Date(date).toLocaleDateString('en', { weekday: 'short' });
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-gray-400">{count}</span>
                    <div className="w-full bg-amber-100 dark:bg-amber-900/20 rounded-t relative" style={{ height: `${height}%` }}>
                      <div className="absolute inset-0 bg-amber-600 rounded-t opacity-80" style={{ height: '100%' }} />
                    </div>
                    <span className="text-[8px] text-gray-500 font-bold uppercase">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-4">{articlesThisWeek} articles published this week</p>
          </div>
        )}
        {topArticles.length > 0 && (
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white mb-4">Top Articles</h3>
            <div className="flex flex-col gap-3">
              {topArticles.map((a: any, i: number) => (
                <div key={a.id} className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-300 dark:text-gray-600 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-vibrant-text dark:text-white line-clamp-1">{a.title}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600">{a.views} views</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── News Tab ─────────────────────────────────────────────────────────────────

function NewsTab() {
  const { news, updateNews, deleteNews, isAdmin } = useAppContext();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(news.map(n => n.category)))];

  const filtered = useMemo(() => {
    return news.filter(n => {
      const matchCat = catFilter === 'All' || n.category === catFilter;
      const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [news, search, catFilter]);

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-vibrant-text dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30"
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">
        Showing {filtered.length} of {news.length} articles
      </p>

      {/* Table */}
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Article</th>
                <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hidden lg:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Flags</th>
                <th className="text-right px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n, i) => (
                <tr key={n.id}
                  className={`border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-white/[0.01]'}`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={n.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 hidden sm:block" />
                      <p className="font-bold text-vibrant-text dark:text-white line-clamp-1 max-w-[260px]">{n.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{n.category}</span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span className="text-xs text-gray-400">{n.date}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {n.isFeatured && (
                        <span className="text-[9px] font-black uppercase bg-vibrant-primary/10 text-vibrant-primary px-1.5 py-0.5 rounded-full">Featured</span>
                      )}
                      {n.isBreaking && (
                        <span className="text-[9px] font-black uppercase bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full">Breaking</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Toggle featured */}
                      <button
                        onClick={() => updateNews(n.id, { isFeatured: !n.isFeatured })}
                        title={n.isFeatured ? 'Unfeature' : 'Feature'}
                        className={`p-1.5 rounded-lg transition-colors ${n.isFeatured ? 'text-vibrant-primary bg-vibrant-primary/10' : 'text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/10'}`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      {/* Toggle breaking */}
                      <button
                        onClick={() => updateNews(n.id, { isBreaking: !n.isBreaking })}
                        title={n.isBreaking ? 'Remove breaking' : 'Mark breaking'}
                        className={`p-1.5 rounded-lg transition-colors ${n.isBreaking ? 'text-red-500 bg-red-100 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => setEditItem(n)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/10 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete — admin only */}
                      <button
                        onClick={() => isAdmin && setConfirmDelete(n.id)}
                        disabled={!isAdmin}
                        title={isAdmin ? 'Delete' : 'Admin only'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isAdmin
                            ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30 blur-[0.5px]'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
              No articles match your search.
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      <AdminCreatePost isOpen={createOpen} onClose={() => setCreateOpen(false)} />

      {/* Edit modal */}
      <EditNewsModal item={editItem} onClose={() => setEditItem(null)} />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Article"
        message="This will permanently remove the article. This cannot be undone."
        onConfirm={() => { if (confirmDelete) { deleteNews(confirmDelete); setConfirmDelete(null); } }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

// ─── Edit News Modal ──────────────────────────────────────────────────────────

function EditNewsModal({ item, onClose }: { item: NewsItem | null; onClose: () => void }) {
  const { updateNews } = useAppContext();
  const [form, setForm] = useState<Partial<NewsItem>>({});

  React.useEffect(() => {
    if (item) setForm({ ...item, tags: item.tags ?? [] });
  }, [item]);

  if (!item) return null;

  const handleSave = () => {
    updateNews(item.id, {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      imageUrl: form.imageUrl,
      videoUrl: form.videoUrl,
      driveUrl: form.driveUrl,
      isFeatured: form.isFeatured,
      isBreaking: form.isBreaking,
      tags: typeof form.tags === 'string'
        ? (form.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean)
        : form.tags,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#141414] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#141414] z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-vibrant-primary/10 rounded-xl"><Edit2 className="w-4 h-4 text-vibrant-primary" /></div>
              <h2 className="text-lg font-black uppercase tracking-tight text-vibrant-text dark:text-white">Edit Article</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {[
              { label: 'Title', key: 'title', type: 'input' },
              { label: 'Excerpt', key: 'excerpt', type: 'textarea' },
              { label: 'Content', key: 'content', type: 'textarea', rows: 6 },
              { label: 'Image URL', key: 'imageUrl', type: 'input' },
              { label: 'Video URL', key: 'videoUrl', type: 'input' },
              { label: 'Drive URL', key: 'driveUrl', type: 'input' },
              { label: 'Tags (comma separated)', key: 'tags', type: 'input' },
            ].map(({ label, key, type, rows }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</label>
                {type === 'textarea' ? (
                  <textarea
                    rows={rows ?? 3}
                    value={key === 'tags' ? (Array.isArray(form[key as keyof NewsItem]) ? (form[key as keyof NewsItem] as string[]).join(', ') : (form[key as keyof NewsItem] as string) ?? '') : (form[key as keyof NewsItem] as string) ?? ''}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30 resize-none"
                  />
                ) : (
                  <input
                    value={key === 'tags' ? (Array.isArray(form[key as keyof NewsItem]) ? (form[key as keyof NewsItem] as string[]).join(', ') : (form[key as keyof NewsItem] as string) ?? '') : (form[key as keyof NewsItem] as string) ?? ''}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-6">
              {[{ label: 'Featured', key: 'isFeatured' }, { label: 'Breaking', key: 'isBreaking' }].map(({ label, key }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={!!(form[key as keyof NewsItem])}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
                    className="rounded text-vibrant-primary focus:ring-vibrant-primary/30"
                  />
                  <span className="text-sm font-bold text-vibrant-text dark:text-white">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a] flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">Cancel</button>
            <button onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Ads Tab ──────────────────────────────────────────────────────────────────

function AdsTab() {
  const { ads, isAdmin } = useAppContext();
  const [manageOpen, setManageOpen] = useState(false);

  const placementColor: Record<string, string> = {
    top:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    left:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    right:  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    middle: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-bold">{ads.length} advertisements total · {ads.filter(a => a.isActive).length} active</p>
        <button
          onClick={() => setManageOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Manage Ads
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map(ad => (
          <div key={ad.id}
            className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5 flex flex-col gap-3"
          >
            {/* Preview */}
            {(ad.imageUrl || ad.bannerUrl) && (
              <img
                src={ad.bannerUrl || ad.imageUrl}
                alt={ad.title}
                className="w-full h-20 object-cover rounded-xl"
              />
            )}

            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-black text-vibrant-text dark:text-white text-sm line-clamp-1">{ad.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ad.startDate} → {ad.endDate}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${ad.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5'}`}>
                  {ad.isActive ? 'Active' : 'Inactive'}
                </span>
                {ad.isPaid && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-vibrant-primary/10 text-vibrant-primary">Paid</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${placementColor[ad.placement] ?? ''}`}>
                {ad.placement}
              </span>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                {ad.type.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {ads.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
          No advertisements yet. Click "Manage Ads" to create one.
        </div>
      )}

      <AdminManageAds isOpen={manageOpen} onClose={() => setManageOpen(false)} />
    </div>
  );
}

// ─── Comments Tab ─────────────────────────────────────────────────────────────

interface DashComment {
  id: number; article_id: number; article_title: string;
  author_name: string; author_id: string; content: string;
  is_spam: number; is_featured: number; votes: number; created_at: string;
}

function CommentsTab() {
  const { bannedUserIds, banUser, unbanUser, isAdmin } = useAppContext();
  const [comments, setComments] = useState<DashComment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<'all' | 'spam' | 'featured'>('all');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    // Load recent comments from dashboard endpoint
    apiGetDashboard()
      .then(data => setComments(data.recent_comments as DashComment[]))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = comments.filter(c => {
    if (filter === 'spam')     return Boolean(c.is_spam);
    if (filter === 'featured') return Boolean(c.is_featured);
    return true;
  });

  const toggleSpam = async (c: DashComment) => {
    const next = c.is_spam ? 0 : 1;
    setComments(prev => prev.map(x => x.id === c.id ? { ...x, is_spam: next } : x));
    try { await apiUpdateComment(c.id, { is_spam: next }); } catch { /* keep optimistic */ }
  };

  const toggleFeatured = async (c: DashComment) => {
    const next = c.is_featured ? 0 : 1;
    setComments(prev => prev.map(x => x.id === c.id ? { ...x, is_featured: next } : x));
    try { await apiUpdateComment(c.id, { is_featured: next }); } catch { /* keep optimistic */ }
  };

  const deleteComment = async (id: number) => {
    setComments(prev => prev.filter(c => c.id !== id));
    try { await apiDeleteComment(id); } catch { /* keep optimistic */ }
    setConfirmDelete(null);
  };

  const handleBan = async (userId: string) => {
    banUser(userId);
    try { await apiBanUser(userId); } catch { /* keep optimistic */ }
  };

  const handleUnban = async (userId: string) => {
    unbanUser(userId);
    try { await apiUnbanUser(userId); } catch { /* keep optimistic */ }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
      <RefreshCw className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading comments...</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        {(['all', 'spam', 'featured'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filter === f ? 'bg-vibrant-primary text-white shadow-lg shadow-vibrant-primary/20' : 'bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-vibrant-primary/30'}`}>
            {f} {f === 'spam' && `(${comments.filter(c => c.is_spam).length})`}
            {f === 'featured' && `(${comments.filter(c => c.is_featured).length})`}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(c => (
          <div key={c.id}
            className={`bg-white dark:bg-[#141414] rounded-2xl border p-5 transition-colors ${c.is_spam ? 'border-red-200 dark:border-red-900/30' : 'border-gray-100 dark:border-white/5'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-black text-vibrant-text dark:text-white">{c.author_name}</span>
                  {Boolean(c.is_spam) && <span className="text-[9px] font-black uppercase bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full">Spam</span>}
                  {Boolean(c.is_featured) && <span className="text-[9px] font-black uppercase bg-vibrant-primary/10 text-vibrant-primary px-1.5 py-0.5 rounded-full">Featured</span>}
                  {c.author_id && bannedUserIds.includes(c.author_id) && <span className="text-[9px] font-black uppercase bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded-full">Banned</span>}
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  On: <span className="font-bold text-gray-500 dark:text-gray-400">{c.article_title}</span>
                  {' · '}{new Date(c.created_at).toLocaleDateString()}
                  {' · '}{c.votes} votes
                </p>
                <p className="text-sm text-vibrant-text dark:text-gray-300 leading-relaxed">{c.content}</p>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button onClick={() => toggleFeatured(c)}
                  className={`p-1.5 rounded-lg transition-colors ${c.is_featured ? 'text-vibrant-primary bg-vibrant-primary/10' : 'text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/10'}`}>
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => toggleSpam(c)}
                  className={`p-1.5 rounded-lg transition-colors ${c.is_spam ? 'text-red-500 bg-red-100 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>
                {(isAdmin || c.author_id) && !bannedUserIds.includes(c.author_id) && (
                  <button onClick={() => isAdmin && handleBan(c.author_id)}
                    disabled={!isAdmin} title={isAdmin ? 'Ban user' : 'Admin only'}
                    className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30 blur-[0.5px]'}`}>
                    <ShieldBan className="w-3.5 h-3.5" />
                  </button>
                )}
                {(isAdmin || c.author_id) && bannedUserIds.includes(c.author_id) && (
                  <button onClick={() => isAdmin && handleUnban(c.author_id)}
                    disabled={!isAdmin} title={isAdmin ? 'Unban user' : 'Admin only'}
                    className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/20' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30 blur-[0.5px]'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => isAdmin && setConfirmDelete(c.id)}
                  disabled={!isAdmin} title={isAdmin ? 'Delete comment' : 'Admin only'}
                  className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30 blur-[0.5px]'}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">No comments in this filter.</div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Comment"
        message="This will permanently remove the comment."
        onConfirm={() => { if (confirmDelete !== null) deleteComment(confirmDelete); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

// ─── Staff Tab ────────────────────────────────────────────────────────────────

interface ApiStaffRow {
  id: number; username: string; email: string; full_name: string;
  display_name: string; role: 'editor' | 'reporter' | 'moderator';
  roles: string[];
  is_active: number; last_login: string; created_at: string;
}

const VALID_ROLES = ['editor', 'reporter', 'moderator'] as const;

const ROLE_DESCRIPTIONS: Record<string, string> = {
  editor: 'writes and edits articles',
  reporter: 'files reports and updates',
  moderator: 'manages comments',
};

function StaffTab() {
  const [staff, setStaff]           = useState<ApiStaffRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState<ApiStaffRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
const [form, setForm] = useState({
    full_name: '', password: '',
    roles: ['editor'] as string[],
  });

  const [showPw, setShowPw]     = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving]     = useState(false);

  const loadStaffFromApi = async () => {
    setLoading(true);
    try { setStaff(await apiGetStaff() as ApiStaffRow[]); }
    catch { setStaff([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadStaffFromApi(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ full_name: '', password: '', roles: ['editor'] });
    setFormError(''); setShowForm(true);
  };

  const openEdit = (s: ApiStaffRow) => {
    setEditTarget(s);
    setForm({ full_name: s.full_name, password: '', roles: s.roles?.length ? s.roles : [s.role] });
    setFormError(''); setShowForm(true);
  };

const handleSave = async () => {
    setFormError('');
    if (form.roles.length === 0) { setFormError('Select at least one role.'); return; }
    if (!editTarget && form.password.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
    if (form.password && form.password.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await apiUpdateStaff(editTarget.id, {
          full_name: form.full_name, roles: form.roles,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await apiCreateStaff({ password: form.password, full_name: form.full_name, roles: form.roles });
      }
      await loadStaffFromApi();
      setShowForm(false); setEditTarget(null);
    } catch (err: any) {
      setFormError(err?.message ?? 'Failed to save. Try again.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await apiDeleteStaff(id); await loadStaffFromApi(); }
    catch { /* ignore */ }
    setConfirmDelete(null);
  };

  const toggleActive = async (s: ApiStaffRow) => {
    try { await apiUpdateStaff(s.id, { is_active: s.is_active ? 0 : 1 }); await loadStaffFromApi(); }
    catch { /* ignore */ }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
      <RefreshCw className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading staff...</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-bold">{staff.length} staff members · {staff.filter(s => s.is_active).length} active</p>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all">
          <UserPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.map(s => (
          <div key={s.id} className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-vibrant-primary/10 flex items-center justify-center shrink-0">
              <span className="text-vibrant-primary font-black text-sm uppercase">
                {(s.display_name || s.full_name || s.username)[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-black text-vibrant-text dark:text-white text-sm">{s.display_name || s.full_name || s.username || 'Staff'}</span>
                {(s.roles?.length ? s.roles : [s.role]).map(r => (
                  <span key={r} className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${ROLE_COLORS[r] ?? ''}`}>{r}</span>
                ))}
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500'}`}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-400">@{s.username} · {s.email}</p>
              <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">
                Added {new Date(s.created_at).toLocaleDateString()}
                {s.last_login && ` · Last login ${new Date(s.last_login).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={() => toggleActive(s)}
                className={`p-1.5 rounded-lg transition-colors ${s.is_active ? 'text-green-600 bg-green-100 dark:bg-green-900/20' : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10'}`}>
                {s.is_active ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => openEdit(s)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/10 transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setConfirmDelete(s.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">No staff accounts yet. Add one to get started.</div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-vibrant-primary/10 rounded-xl"><UserPlus className="w-4 h-4 text-vibrant-primary" /></div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-vibrant-text dark:text-white">
                    {editTarget ? 'Edit Staff' : 'Add Staff Member'}
                  </h2>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4">
                {[
                  { label: 'Full Name', key: 'full_name', placeholder: 'Jane Doe' },
                  { label: 'Email *', key: 'email', placeholder: 'jane@yoursite.com' },
                ].map(({ label, key, placeholder, disabled }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</label>
                    <input
                      placeholder={placeholder}
                      disabled={disabled}
                      value={form[key as keyof typeof form] as string}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30 disabled:opacity-50"
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Password {editTarget ? '(leave blank to keep current)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder={editTarget ? '••••••••' : 'Min 8 characters'}
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30"
                    />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-vibrant-primary transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Roles *</label>
                  <div className="flex flex-col gap-2">
                    {VALID_ROLES.map(r => {
                      const checked = form.roles.includes(r);
                      return (
                        <label key={r} className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-vibrant-primary/30 transition-colors">
                          <input type="checkbox" checked={checked} onChange={() => {
                            setForm(p => ({
                              ...p,
                              roles: checked ? p.roles.filter(x => x !== r) : [...p.roles, r],
                            }));
                          }}
                            className="w-4 h-4 rounded border-gray-300 text-vibrant-primary focus:ring-vibrant-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-vibrant-text dark:text-white capitalize">{r}</p>
                            <p className="text-[10px] text-gray-400">{ROLE_DESCRIPTIONS[r]}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {formError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {formError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a] flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" /> {editTarget ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove Staff Member"
        message="This will permanently delete the staff account. They will no longer be able to log in."
        onConfirm={() => { if (confirmDelete !== null) handleDelete(confirmDelete); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateProfile } = useAppContext();
  const [form, setForm] = useState({
    name:        user?.name        ?? '',
    bio:         user?.bio         ?? '',
    avatarUrl:   user?.avatarUrl   ?? '',
    twitterUrl:  user?.twitterUrl  ?? '',
    linkedinUrl: user?.linkedinUrl ?? '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const roleLabel = user?.role === 'admin'
    ? 'Administrator'
    : `Staff · ${user?.staffRole ?? ''}`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Preview card */}
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-6 flex items-start gap-5">
        <div className="relative shrink-0">
          {form.avatarUrl ? (
            <img src={form.avatarUrl} alt={form.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-vibrant-primary/20" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-vibrant-primary/10 flex items-center justify-center border-2 border-vibrant-primary/20">
              <span className="text-vibrant-primary font-black text-3xl uppercase">
                {form.name?.[0] ?? '?'}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 p-1 bg-vibrant-primary rounded-lg">
            <Camera className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <p className="text-lg font-black text-vibrant-text dark:text-white">{form.name || 'Your Name'}</p>
          <p className="text-xs font-bold text-vibrant-primary uppercase tracking-widest mt-0.5">{roleLabel}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed line-clamp-2">
            {form.bio || 'Your bio will appear here and on the public team page.'}
          </p>
          <div className="flex items-center gap-3 mt-3">
            {form.twitterUrl && (
              <a href={form.twitterUrl} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-vibrant-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {form.linkedinUrl && (
              <a href={form.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-vibrant-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white mb-5">
          Edit Journalist Profile
        </h3>

        <div className="flex flex-col gap-4">
          {/* Display name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Display Name <span className="text-vibrant-primary">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Yusuf Abubakar"
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30"
            />
            <p className="text-[10px] text-gray-400">
              This name appears on article bylines and the public team page.
            </p>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="A short description about yourself and your journalism focus..."
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30 resize-none"
            />
          </div>

          {/* Avatar — URL or upload */}
          <MediaInput
            context="profile"
            label="Profile Photo"
            value={form.avatarUrl}
            onChange={url => setForm(p => ({ ...p, avatarUrl: url }))}
          />

          {/* Social links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                <Twitter className="w-3 h-3" /> Twitter / X URL
              </label>
              <input
                value={form.twitterUrl}
                onChange={e => setForm(p => ({ ...p, twitterUrl: e.target.value }))}
                placeholder="https://twitter.com/yourhandle"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                <Linkedin className="w-3 h-3" /> LinkedIn URL
              </label>
              <input
                value={form.linkedinUrl}
                onChange={e => setForm(p => ({ ...p, linkedinUrl: e.target.value }))}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <AnimatePresence>
            {saved && (
              <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                <CheckCircle className="w-4 h-4" /> Profile saved
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </div>

      {/* Read-only info */}
      <div className="bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Account Info (read-only)</p>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Role</span>
            <span className="font-bold text-vibrant-text dark:text-white capitalize">{roleLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Login</span>
            <span className="font-bold text-vibrant-text dark:text-white">Password-only (no username)</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-3 italic">
          Username, email, and password can only be changed by an administrator.
        </p>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { storageSize, clearOldCache, theme, toggleTheme } = useAppContext();
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: 'JM News', site_tagline: 'Factual & Timely News',
    site_email: 'info@jmnews.com.ng', site_phone: '+234 (0) 123 456 789',
    site_address: '123 News Plaza, Yola, Adamawa State',
    whatsapp_channel: '', facebook_url: '', twitter_url: '', instagram_url: '',
  });
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetSettings()
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(() => {
        // Fallback to localStorage
        try {
          const local = localStorage.getItem('jm_site_settings');
          if (local) setSettings(prev => ({ ...prev, ...JSON.parse(local) }));
        } catch { /* ignore */ }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiUpdateSettings(settings);
      localStorage.setItem('jm_site_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // Fallback to localStorage only
      localStorage.setItem('jm_site_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const storagePct = Math.min(100, Math.round((storageSize / (5 * 1024 * 1024)) * 100));

  const fields: { label: string; key: string; placeholder?: string }[] = [
    { label: 'Site Name',           key: 'site_name' },
    { label: 'Tagline',             key: 'site_tagline' },
    { label: 'Contact Email',       key: 'site_email',       placeholder: 'info@yoursite.com' },
    { label: 'Phone',               key: 'site_phone' },
    { label: 'Address',             key: 'site_address' },
    { label: 'WhatsApp Channel URL',key: 'whatsapp_channel' },
    { label: 'Facebook URL',        key: 'facebook_url' },
    { label: 'Twitter / X URL',     key: 'twitter_url' },
    { label: 'Instagram URL',       key: 'instagram_url' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white mb-5">Site Settings</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 py-4">
            <RefreshCw className="w-4 h-4 animate-spin" /><span className="text-sm">Loading settings...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ label, key, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</label>
                <input
                  value={settings[key] ?? ''}
                  placeholder={placeholder}
                  onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30"
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-end gap-3 mt-6">
          <AnimatePresence>
            {saved && (
              <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                <CheckCircle className="w-4 h-4" /> Saved
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white mb-5">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-vibrant-text dark:text-white">Theme</p>
            <p className="text-xs text-gray-400 mt-0.5">Currently: {theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
          </div>
          <button onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-vibrant-text dark:text-white hover:border-vibrant-primary/30 transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white mb-5">Local Storage</h3>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Used</span>
            <span className="font-bold text-vibrant-text dark:text-white">
              {(storageSize / 1024).toFixed(1)} KB / 5 MB ({storagePct}%)
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${storagePct > 80 ? 'bg-red-500' : storagePct > 60 ? 'bg-orange-400' : 'bg-vibrant-primary'}`}
              style={{ width: `${storagePct}%` }} />
          </div>
          {storagePct > 60 && (
            <p className="text-xs text-orange-500 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Storage is getting full.
            </p>
          )}
          <button onClick={clearOldCache}
            className="self-start flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-vibrant-text dark:text-white hover:border-vibrant-primary/30 transition-colors">
            <RefreshCw className="w-4 h-4" /> Clear Old Cache
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ open, title, message, onConfirm, onCancel }: {
  open: boolean; title: string; message: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-black text-vibrant-text dark:text-white">{title}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel}
                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Cancel
              </button>
              <button onClick={onConfirm}
                className="px-5 py-2.5 bg-red-500 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-red-600 active:scale-95 transition-all">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Staff Portal Shell ───────────────────────────────────────────────────────

type StaffTab = 'post_news' | 'post_ads' | 'comments' | 'profile' | 'overview';

const STAFF_TABS: { id: StaffTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',   label: 'News Contents',  icon: LayoutDashboard },
  { id: 'post_news',  label: 'Post News',      icon: Newspaper },
  { id: 'post_ads',   label: 'Post Ads',       icon: Megaphone },
  { id: 'comments',   label: 'Moderation',     icon: MessageSquare },
  { id: 'profile',    label: 'My Profile',     icon: User },
];

function RestrictedAccess() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Lock className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <h2 className="text-lg font-black uppercase tracking-tight text-gray-400 dark:text-gray-500 mb-2">Admin Access Required</h2>
      <p className="text-sm text-gray-400 dark:text-gray-600 max-w-sm">This section is restricted to administrators only. Contact your admin for access.</p>
    </div>
  );
}

function StaffPortal() {
  const { user, logout } = useAppContext();
  const { tab: urlTab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StaffTab>(() => (STAFF_URL_TO_TAB[urlTab ?? ''] as StaffTab) || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const lastTabRef = useRef(activeTab);
  useEffect(() => {
    if (lastTabRef.current !== activeTab) {
      lastTabRef.current = activeTab;
      const url = STAFF_TAB_TO_URL[activeTab];
      if (url) {
        navigate(`/staff/${url}`, { replace: true });
      }
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    const mapped = STAFF_URL_TO_TAB[urlTab ?? ''] as StaffTab | undefined;
    if (mapped && mapped !== activeTab) {
      setActiveTab(mapped);
    }
  }, [urlTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: StaffTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':  return <OverviewTab onTabChange={handleTabChange} />;
      case 'post_news': return <NewsTab />;
      case 'post_ads':  return <AdsTab />;
      case 'comments':  return <CommentsTab />;
      case 'profile':   return <ProfileTab />;
      default:          return <RestrictedAccess />;
    }
  };

  const currentTab = STAFF_TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-64 bg-white dark:bg-[#111] border-r border-gray-100 dark:border-white/5
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-vibrant-primary flex items-center justify-center shadow-lg shadow-vibrant-primary/30">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight text-vibrant-text dark:text-white">JM News</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">Staff Portal</p>
              </div>
            </div>
            <Link to="/" title="Go to Homepage"
              className="p-2 rounded-xl text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/10 transition-colors">
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {TAB_CONFIG.map((tab, idx) => {
            const Icon = tab.icon;
            const isDisabled = tab.adminOnly;
            const isStaffTab = STAFF_TABS.some(t => t.id === tab.id);
            if (!isDisabled && !isStaffTab) return null;

            const tabUrl = STAFF_TAB_TO_URL[tab.id as StaffTab];
            const active = activeTab === tab.id;

            const isFirstAdminOnly = idx === TAB_CONFIG.findIndex(t => t.adminOnly);

            if (isDisabled) {
              return (
                <React.Fragment key={tab.id}>
                  {isFirstAdminOnly && (
                    <div className="pt-3 pb-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600 px-2">Admin Only</p>
                    </div>
                  )}
                  <div
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 dark:text-gray-600 cursor-not-allowed select-none pointer-events-none opacity-40 blur-[0.5px]"
                    title="Admin access required"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                    <Lock className="w-3 h-3 ml-auto shrink-0" />
                  </div>
                </React.Fragment>
              );
            }

            return (
              <Link key={tab.id}
                to={`/staff/${tabUrl}`}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                  active
                    ? 'bg-vibrant-primary text-white shadow-lg shadow-vibrant-primary/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-vibrant-text dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-vibrant-primary/10 flex items-center justify-center shrink-0">
              <span className="text-vibrant-primary font-black text-xs uppercase">{user?.name?.[0] ?? 'S'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-vibrant-text dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">Staff · {user?.staffRole}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/5 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(p => !p)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black uppercase tracking-tight text-vibrant-text dark:text-white">
              {currentTab?.label}
            </h1>
          </div>
          <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full hidden sm:inline-flex ${ROLE_COLORS[user?.staffRole ?? 'editor']}`}>
            Staff · {user?.staffRole}
          </span>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {renderTab()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

// ─── Main Dashboard Shell ─────────────────────────────────────────────────────

const TAB_CONFIG: { id: Tab; label: string; icon: React.ElementType; adminOnly?: boolean; divider?: boolean }[] = [
  { id: 'overview',     label: 'News Contents',     icon: LayoutDashboard },
  { id: 'news',         label: 'Post News',          icon: Newspaper },
  { id: 'ads',          label: 'Post Ads',           icon: Megaphone },
  { id: 'comments',     label: 'Comment Moderation', icon: MessageSquare },
  { id: 'staff',        label: 'Staff Management',   icon: Users,    adminOnly: true },
  { id: 'profile',      label: 'Journalist Profile', icon: User },
  { id: 'settings',     label: 'Settings',           icon: Settings, adminOnly: true },
  { id: 'branding',     label: 'Branding',           icon: Globe,    adminOnly: true, divider: true },
  { id: 'socials',      label: 'Social Links',       icon: Share2,   adminOnly: true },
  { id: 'news-types',   label: 'News Types',         icon: List,     adminOnly: true },
  { id: 'quick-links',  label: 'Quick Links',        icon: Layout,   adminOnly: true },
  { id: 'ctas',         label: 'CTA Elements',       icon: Smartphone, adminOnly: true },
  { id: 'page-elements',label: 'Page Elements',      icon: ImageIcon,    adminOnly: true },
];

const URL_TO_TAB: Record<string, Tab> = {
  dashboard: 'overview',
  news: 'news',
  ads: 'ads',
  comments: 'comments',
  staff: 'staff',
  profile: 'profile',
  settings: 'settings',
  branding: 'branding',
  social_links: 'socials',
  news_types: 'news-types',
  quick_links: 'quick-links',
  ctas: 'ctas',
  page_elements: 'page-elements',
};

const TAB_TO_URL: Record<Tab, string> = {
  overview: 'dashboard',
  news: 'news',
  ads: 'ads',
  comments: 'comments',
  staff: 'staff',
  profile: 'profile',
  settings: 'settings',
  branding: 'branding',
  socials: 'social_links',
  'news-types': 'news_types',
  'quick-links': 'quick_links',
  ctas: 'ctas',
  'page-elements': 'page_elements',
};

const STAFF_URL_TO_TAB: Record<string, StaffTab> = {
  post_news: 'post_news',
  post_ads: 'post_ads',
  comments: 'comments',
  profile: 'profile',
  dashboard: 'overview',
  overview: 'overview',
  news: 'post_news',
  ads: 'post_ads',
};

const STAFF_TAB_TO_URL: Record<StaffTab, string> = {
  post_news: 'post_news',
  post_ads: 'post_ads',
  comments: 'comments',
  profile: 'profile',
  overview: 'dashboard',
};

function DashboardShell() {
  const { user, isAdmin, logout } = useAppContext();
  const { tab: urlTab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id') || '';
  const action = searchParams.get('action') || '';
  const [activeTab, setActiveTab] = useState<Tab>(() => URL_TO_TAB[urlTab ?? ''] || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleTabs = TAB_CONFIG.filter(t => !t.adminOnly || isAdmin);

  // Sync URL when tab changes programmatically (from OverviewTab etc.)
  const lastTabRef = useRef(activeTab);
  useEffect(() => {
    if (lastTabRef.current !== activeTab) {
      lastTabRef.current = activeTab;
      const url = TAB_TO_URL[activeTab];
      if (url) {
        navigate(`/admin/${url}`, { replace: true });
      }
    }
  }, [activeTab, navigate]);

  // Sync tab when URL changes (direct navigation or back/forward)
  useEffect(() => {
    const mapped = URL_TO_TAB[urlTab ?? ''];
    if (mapped && mapped !== activeTab) {
      setActiveTab(mapped);
    }
  }, [urlTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':     return <OverviewTab onTabChange={handleTabChange} />;
      case 'news':         return <NewsTab />;
      case 'ads':          return <AdsTab />;
      case 'comments':     return <CommentsTab />;
      case 'staff':        return isAdmin ? <StaffTab /> : null;
      case 'profile':      return <ProfileTab />;
      case 'settings':     return isAdmin ? <SettingsTab /> : null;
      case 'branding':     return isAdmin ? <AdminBranding /> : null;
      case 'socials':      return isAdmin ? <AdminSocials editId={editId} action={action} /> : null;
      case 'news-types':   return isAdmin ? <AdminNewsTypes editId={editId} action={action} /> : null;
      case 'quick-links':  return isAdmin ? <AdminQuickLinks editId={editId} action={action} /> : null;
      case 'ctas':         return isAdmin ? <AdminCTAs editId={editId} action={action} /> : null;
      case 'page-elements':return isAdmin ? <AdminPageElements /> : null;
      default:             return null;
    }
  };

  const currentTab = TAB_CONFIG.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex">

      {/* ── Sidebar ── */}
      <>
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" />
          )}
        </AnimatePresence>

        <aside className={`
          fixed top-0 left-0 h-full z-50 w-64 bg-white dark:bg-[#111] border-r border-gray-100 dark:border-white/5
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          {/* Brand */}
          <div className="p-6 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-vibrant-primary flex items-center justify-center shadow-lg shadow-vibrant-primary/30">
                  <Newspaper className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight text-vibrant-text dark:text-white">JM News</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">Admin Panel</p>
                </div>
              </div>
              <Link to="/" title="Go to Homepage"
                className="p-2 rounded-xl text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/10 transition-colors">
                <Home className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
            {visibleTabs.map((tab, idx) => {
              const Icon = tab.icon;
              const tabUrl = TAB_TO_URL[tab.id];
              const active = activeTab === tab.id;
              const isDivider = tab.divider;
              return (
                <React.Fragment key={tab.id}>
                  {(isDivider || (tab.adminOnly && !active)) && (
                    <div className="pt-3 pb-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 px-2">
                        {isDivider ? 'CMS Customization' : 'Admin Only'}
                      </p>
                    </div>
                  )}
                  <Link
                    to={`/admin/${tabUrl}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                      active
                        ? 'bg-vibrant-primary text-white shadow-lg shadow-vibrant-primary/20'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-vibrant-text dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                    {tab.adminOnly && !active && (
                      <span className="ml-auto text-[9px] font-black uppercase text-gray-300 dark:text-gray-600">Admin</span>
                    )}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Theme Manager Link */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5">
            <Link to="/admin/themes"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-vibrant-text dark:hover:text-white"
            >
              <Palette className="w-4 h-4 shrink-0" />
              Theme Manager
              <span className="ml-auto text-[9px] font-black uppercase text-gray-300 dark:text-gray-600">Admin</span>
            </Link>
          </div>

          {/* User info + logout */}
          <div className="p-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-lg bg-vibrant-primary/10 flex items-center justify-center shrink-0">
                <span className="text-vibrant-primary font-black text-xs uppercase">
                  {user?.name?.[0] ?? 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-vibrant-text dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400 capitalize">
                  {user?.role === 'staff' ? `Staff · ${user.staffRole}` : 'Administrator'}
                </p>
              </div>
            </div>
            <button onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/5 px-4 lg:px-8 py-4 flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button onClick={() => setSidebarOpen(p => !p)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black uppercase tracking-tight text-vibrant-text dark:text-white">
              {currentTab?.label}
            </h1>
          </div>

          {/* Role badge */}
          <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full hidden sm:inline-flex ${
            isAdmin
              ? 'bg-vibrant-primary/10 text-vibrant-primary'
              : `${ROLE_COLORS[user?.staffRole ?? 'editor']}`
          }`}>
            {isAdmin ? 'Admin' : `Staff · ${user?.staffRole}`}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAppContext();
  if (!user) return <LoginScreen />;
  if (user.role === 'staff') return <StaffPortal />;
  return <DashboardShell />;
}
