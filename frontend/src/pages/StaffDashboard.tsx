import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Newspaper, Megaphone, MessageSquare,
  LogOut, Plus, Edit2, Trash2, Star, Zap, ShieldBan,
  ShieldCheck, Search, X, Save,
  AlertTriangle, Unlock, Lock,
  RefreshCw, Menu, Home,
  BarChart2,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { NewsItem } from '../types';
import AdminCreatePost from '../components/admin/AdminCreatePost';
import AdminManageAds from '../components/admin/AdminManageAds';
import {
  apiGetDashboard, apiUpdateComment, apiDeleteComment, apiBanUser, apiUnbanUser,
} from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'news' | 'ads' | 'comments' | 'staff' | 'profile' | 'settings' | 'branding' | 'socials' | 'news-types' | 'quick-links' | 'ctas' | 'page-elements';

// ─── Role → Tab mapping ───────────────────────────────────────────────────────

const ROLE_TAB_ACCESS: Record<string, Tab[]> = {
  editor:    ['overview', 'news'],
  reporter:  ['overview', 'ads'],
  moderator: ['overview', 'comments'],
};

function hasRoleAccess(userRoles: string[], tab: Tab): boolean {
  if (tab === 'profile') return true;
  return userRoles.some(r => (ROLE_TAB_ACCESS[r] ?? []).includes(tab));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  editor:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  reporter:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  moderator: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-vibrant-text dark:text-white">{value}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

interface DashComment {
  id: number; article_id: number; article_title: string;
  author_name: string; author_id: string;
  content: string; votes: number; is_spam: number; is_featured: number;
  created_at: string;
}

function OverviewTab({ onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const { news, ads } = useAppContext();
  const [dashboard, setDashboard] = useState<{
    stats: { articles: number; drafts: number; comments: number; spam_comments: number; ads_active: number; ads_total: number; banned_users: number };
    daily_activity: { date: string; count: number }[];
    articles_this_week: number;
    recent_articles: { id: number; title: string; slug: string; created_at: string; category: string }[];
    recent_comments: DashComment[];
  } | null>(null);

  useEffect(() => {
    apiGetDashboard()
      .then(setDashboard)
      .catch(() => setDashboard(null));
  }, []);

  const topArticles = useMemo(() => {
    return [...news]
      .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (b.isBreaking ? 1 : 0) - (a.isBreaking ? 1 : 0))
      .slice(0, 5);
  }, [news]);

  const stats = dashboard?.stats || { articles: 0, drafts: 0, comments: 0, spam_comments: 0, ads_active: 0, ads_total: 0, banned_users: 0 };
  const dailyActivity = dashboard?.daily_activity || [];
  const articlesThisWeek = dashboard?.articles_this_week ?? (dashboard?.stats?.articles ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Newspaper} label="Articles" value={stats.articles} color="bg-vibrant-primary" />
        <StatCard icon={MessageSquare} label="Comments" value={stats.comments} color="bg-blue-500" />
        <StatCard icon={Megaphone} label="Active Ads" value={stats.ads_active} color="bg-purple-500" />
        <StatCard icon={BarChart2} label="This Week" value={articlesThisWeek} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white mb-4">Daily Activity (7 days)</h3>
          <div className="flex items-end gap-2 h-32">
            {dailyActivity.length > 0 ? dailyActivity.map((d, i) => {
              const maxCount = Math.max(...dailyActivity.map(x => x.count), 1);
              const height = (d.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400 font-bold">{d.count}</span>
                  <div className="w-full bg-vibrant-primary/10 rounded-t-lg relative" style={{ height: `${Math.max(height, 4)}%` }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-vibrant-primary rounded-t-lg transition-all" style={{ height: `${height}%` }} />
                  </div>
                  <span className="text-[8px] text-gray-400">{d.date.slice(5)}</span>
                </div>
              );
            }) : (
              <div className="w-full flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white">Top Articles</h3>
            {dashboard?.recent_articles && dashboard.recent_articles.length > 0 && (
              <button onClick={() => onTabChange('news')} className="text-[10px] font-black uppercase tracking-widest text-vibrant-primary hover:underline">View All</button>
            )}
          </div>
          {topArticles.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No articles yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topArticles.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-white/5 last:border-0">
                  <span className="text-xs font-black text-gray-300 dark:text-gray-600 w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-vibrant-text dark:text-white truncate">{a.title}</p>
                    <p className="text-[10px] text-gray-400">{a.category} · {a.date}</p>
                  </div>
                  {a.isFeatured && <Star className="w-3.5 h-3.5 text-vibrant-primary shrink-0" />}
                  {a.isBreaking && <Zap className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Limited News Tab ─────────────────────────────────────────────────────────

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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-vibrant-text dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">Showing {filtered.length} of {news.length} articles</p>

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
                  className={`border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-white/[0.01]'}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={n.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 hidden sm:block" />
                      <p className="font-bold text-vibrant-text dark:text-white line-clamp-1 max-w-[260px]">{n.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell"><span className="text-xs font-bold text-gray-500 dark:text-gray-400">{n.category}</span></td>
                  <td className="px-5 py-3 hidden lg:table-cell"><span className="text-xs text-gray-400">{n.date}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {n.isFeatured && <span className="text-[9px] font-black uppercase bg-vibrant-primary/10 text-vibrant-primary px-1.5 py-0.5 rounded-full">Featured</span>}
                      {n.isBreaking && <span className="text-[9px] font-black uppercase bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full">Breaking</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => updateNews(n.id, { isFeatured: !n.isFeatured })}
                        className={`p-1.5 rounded-lg transition-colors ${n.isFeatured ? 'text-vibrant-primary bg-vibrant-primary/10' : 'text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/10'}`}>
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => updateNews(n.id, { isBreaking: !n.isBreaking })}
                        className={`p-1.5 rounded-lg transition-colors ${n.isBreaking ? 'text-red-500 bg-red-100 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}>
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditItem(n)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/10 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => isAdmin && setConfirmDelete(n.id)} disabled={!isAdmin} title={isAdmin ? 'Delete' : 'Admin only'}
                        className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30 blur-[0.5px]'}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">No articles match your search.</div>}
        </div>
      </div>

      <AdminCreatePost isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <EditNewsModal item={editItem} onClose={() => setEditItem(null)} />
      <ConfirmDialog open={!!confirmDelete} title="Delete Article" message="This will permanently remove the article. This cannot be undone."
        onConfirm={() => { if (confirmDelete) { deleteNews(confirmDelete); setConfirmDelete(null); } }} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

// ─── Edit News Modal ──────────────────────────────────────────────────────────

function EditNewsModal({ item, onClose }: { item: NewsItem | null; onClose: () => void }) {
  const { updateNews } = useAppContext();
  const [form, setForm] = useState<Partial<NewsItem>>({});

  React.useEffect(() => { if (item) setForm({ ...item, tags: item.tags ?? [] }); }, [item]);

  if (!item) return null;

  const handleSave = () => {
    updateNews(item.id, {
      title: form.title, excerpt: form.excerpt, content: form.content,
      category: form.category, imageUrl: form.imageUrl, videoUrl: form.videoUrl,
      driveUrl: form.driveUrl, isFeatured: form.isFeatured, isBreaking: form.isBreaking,
      tags: typeof form.tags === 'string' ? (form.tags as string).split(',').map(t => t.trim()).filter(Boolean) : form.tags,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#141414] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
              { label: 'Title', key: 'title', placeholder: 'Article title' },
              { label: 'Excerpt', key: 'excerpt', placeholder: 'Brief summary...' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</label>
                <input value={form[key as keyof typeof form] as string || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30" />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Content</label>
              <textarea value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Image URL</label>
              <input value={form.imageUrl || ''} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Category</label>
              <input value={form.category || ''} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Politics, Tech"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-vibrant-primary focus:ring-vibrant-primary" />
                <span className="text-xs font-bold text-vibrant-text dark:text-white">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.isBreaking} onChange={e => setForm(p => ({ ...p, isBreaking: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-vibrant-primary focus:ring-vibrant-primary" />
                <span className="text-xs font-bold text-vibrant-text dark:text-white">Breaking</span>
              </label>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tags (comma-separated)</label>
              <input value={Array.isArray(form.tags) ? form.tags.join(', ') : ''} onChange={e => setForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                placeholder="tag1, tag2, tag3"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30" />
            </div>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a] flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Limited Ads Tab ──────────────────────────────────────────────────────────

function AdsTab() {
  const { ads, updateAd, deleteAd, isAdmin } = useAppContext();
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-bold">{ads.length} advertisements</p>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> New Ad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map(ad => (
          <div key={ad.id} className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-vibrant-text dark:text-white">{ad.title}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{ad.placement} · {ad.type}</p>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${ad.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500'}`}>
                {ad.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {ad.imageUrl && <img src={ad.imageUrl} alt="" className="w-full h-24 object-cover rounded-xl mb-3" />}
            <div className="flex items-center gap-2">
              <button onClick={() => updateAd(ad.id, { isActive: !ad.isActive })}
                className={`p-1.5 rounded-lg transition-colors ${ad.isActive ? 'text-green-600 bg-green-100 dark:bg-green-900/20' : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10'}`}>
                {ad.isActive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => isAdmin && setConfirmDelete(ad.id)} disabled={!isAdmin} title={isAdmin ? 'Delete' : 'Admin only'}
                className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30 blur-[0.5px]'}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {ads.length === 0 && <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">No ads yet.</div>}

      <AdminManageAds isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <ConfirmDialog open={!!confirmDelete} title="Delete Advertisement" message="This will permanently remove the ad."
        onConfirm={() => { if (confirmDelete) { deleteAd(confirmDelete); setConfirmDelete(null); } }} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

// ─── Comments Tab ─────────────────────────────────────────────────────────────

function CommentsTab() {
  const { bannedUserIds, banUser, unbanUser, isAdmin } = useAppContext();
  const [comments, setComments] = useState<DashComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'spam' | 'featured'>('all');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    apiGetDashboard()
      .then(data => setComments(data.recent_comments as DashComment[]))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = comments.filter(c => {
    if (filter === 'spam') return Boolean(c.is_spam);
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

  const handleBan = async (userId: string) => {
    banUser(userId);
    try { await apiBanUser(userId); } catch { /* keep optimistic */ }
  };

  const handleUnban = async (userId: string) => {
    unbanUser(userId);
    try { await apiUnbanUser(userId); } catch { /* keep optimistic */ }
  };

  const deleteComment = async (id: number) => {
    setComments(prev => prev.filter(c => c.id !== id));
    try { await apiDeleteComment(id); } catch { /* keep optimistic */ }
    setConfirmDelete(null);
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
                  <button onClick={() => isAdmin && handleBan(c.author_id)} disabled={!isAdmin} title={isAdmin ? 'Ban user' : 'Admin only'}
                    className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30 blur-[0.5px]'}`}>
                    <ShieldBan className="w-3.5 h-3.5" />
                  </button>
                )}
                {(isAdmin || c.author_id) && bannedUserIds.includes(c.author_id) && (
                  <button onClick={() => isAdmin && handleUnban(c.author_id)} disabled={!isAdmin} title={isAdmin ? 'Unban user' : 'Admin only'}
                    className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/20' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30 blur-[0.5px]'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => isAdmin && setConfirmDelete(c.id)} disabled={!isAdmin} title={isAdmin ? 'Delete comment' : 'Admin only'}
                  className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30 blur-[0.5px]'}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">No comments in this filter.</div>}
      </div>

      <ConfirmDialog open={confirmDelete !== null} title="Delete Comment" message="This will permanently remove the comment."
        onConfirm={() => { if (confirmDelete !== null) deleteComment(confirmDelete); }} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateProfile } = useAppContext();
  const [form, setForm] = useState({
    name: user?.name ?? '', bio: user?.bio ?? '',
    avatarUrl: user?.avatarUrl ?? '', twitterUrl: user?.twitterUrl ?? '', linkedinUrl: user?.linkedinUrl ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    updateProfile(form);
    setTimeout(() => setSaving(false), 600);
  };

  return (
    <div className="max-w-lg flex flex-col gap-5">
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-6 flex flex-col gap-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-vibrant-text dark:text-white">Edit Your Profile</h3>
        {[
          { label: 'Display Name', key: 'name', placeholder: 'Your name' },
          { label: 'Bio', key: 'bio', placeholder: 'A short bio...', textarea: true },
          { label: 'Avatar URL', key: 'avatarUrl', placeholder: 'https://...' },
          { label: 'Twitter URL', key: 'twitterUrl', placeholder: 'https://twitter.com/...' },
          { label: 'LinkedIn URL', key: 'linkedinUrl', placeholder: 'https://linkedin.com/in/...' },
        ].map(({ label, key, placeholder, textarea }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</label>
            {textarea ? (
              <textarea value={form[key as keyof typeof form] as string} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} rows={3} placeholder={placeholder}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30" />
            ) : (
              <input value={form[key as keyof typeof form] as string} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30" />
            )}
          </div>
        ))}
        <button onClick={handleSave} disabled={saving}
          className="self-start flex items-center gap-2 px-6 py-2.5 bg-vibrant-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-vibrant-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
          {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ open, title, message, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#141414] rounded-3xl shadow-2xl p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-black text-vibrant-text dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">Cancel</button>
              <button onClick={onConfirm} className="px-6 py-2.5 bg-red-500 text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Tab config (subset of full TAB_CONFIG visible in admin) ──────────────────

const TAB_CONFIG: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'News Contents',     icon: LayoutDashboard },
  { id: 'news',     label: 'Post News',          icon: Newspaper },
  { id: 'ads',      label: 'Post Ads',           icon: Megaphone },
  { id: 'comments', label: 'Comment Moderation', icon: MessageSquare },
  { id: 'profile',  label: 'My Profile',         icon: User },
];

const URL_TO_TAB: Record<string, Tab> = {
  dashboard: 'overview',
  news: 'news',
  ads: 'ads',
  comments: 'comments',
  profile: 'profile',
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

// ─── Main Staff Dashboard Export ──────────────────────────────────────────────

export default function StaffDashboard() {
  const { user, logout } = useAppContext();
  const { tab: urlTab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>(() => URL_TO_TAB[urlTab ?? ''] || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRoles = user?.staffRoles ?? (user?.staffRole ? [user.staffRole] : []);

  const visibleTabs = useMemo(() => {
    return TAB_CONFIG.filter(t => t.id === 'profile' || hasRoleAccess(userRoles, t.id));
  }, [userRoles]);

  // Sync URL when tab changes
  const lastTabRef = useRef(activeTab);
  useEffect(() => {
    if (lastTabRef.current !== activeTab) {
      lastTabRef.current = activeTab;
      const url = TAB_TO_URL[activeTab];
      if (url) {
        navigate(`/staff/${url}`, { replace: true });
      }
    }
  }, [activeTab, navigate]);

  // Sync tab when URL changes
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
      case 'overview': return <OverviewTab onTabChange={handleTabChange} />;
      case 'news':     return <NewsTab />;
      case 'ads':      return <AdsTab />;
      case 'comments': return <CommentsTab />;
      case 'profile':  return <ProfileTab />;
      default:         return null;
    }
  };

  const currentTab = TAB_CONFIG.find(t => t.id === activeTab);

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
        {/* Brand */}
        <div className="p-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-vibrant-primary flex items-center justify-center shadow-lg shadow-vibrant-primary/30">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight text-vibrant-text dark:text-white">JM News</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">Staff Dashboard</p>
              </div>
            </div>
            <Link to="/" title="Go to Homepage"
              className="p-2 rounded-xl text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/10 transition-colors">
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Nav — show all tabs, role-restricted ones are blurred */}
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            const tabUrl = TAB_TO_URL[tab.id];
            const active = activeTab === tab.id;
            const hasAccess = tab.id === 'profile' || hasRoleAccess(userRoles, tab.id);

            if (!hasAccess) {
              return (
                <div key={tab.id}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 dark:text-gray-600 cursor-not-allowed select-none pointer-events-none opacity-40 blur-[0.5px]"
                  title="Not available for your role">
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                  <Lock className="w-3 h-3 ml-auto shrink-0" />
                </div>
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

        {/* User info + logout */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-vibrant-primary/10 flex items-center justify-center shrink-0">
              <span className="text-vibrant-primary font-black text-xs uppercase">{user?.name?.[0] ?? 'S'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-vibrant-text dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">
                Staff · {(user?.staffRoles ?? [user?.staffRole]).filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
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
          <span className="text-[10px] font-black uppercase px-3 py-1.5 rounded-full hidden sm:inline-flex bg-vibrant-primary/10 text-vibrant-primary">
            Staff
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
