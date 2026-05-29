import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Newspaper, Megaphone, MessageSquare,
  LogOut, Plus, Edit2, Trash2, Star, Zap,
  Search, X, Save,
  AlertTriangle, Unlock, Lock,
  RefreshCw, Home,
  BarChart2, User, ShieldCheck, ShieldBan,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { NewsItem } from '../types';
import AdminCreatePost from '../components/admin/AdminCreatePost';
import AdminManageAds from '../components/admin/AdminManageAds';
import {
  apiGetDashboard, apiUpdateComment, apiDeleteComment, apiBanUser, apiUnbanUser,
} from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'news' | 'ads' | 'comments' | 'profile';

// ─── Role access map ────────────────────────────────────────────────────────

const ROLE_TAB_ACCESS: Record<string, Tab[]> = {
  editor:    ['overview', 'news'],
  reporter:  ['overview', 'ads'],
  moderator: ['overview', 'comments'],
};

function hasRoleAccess(userRoles: string[], tab: Tab): boolean {
  if (tab === 'profile') return true;
  return userRoles.some(r => (ROLE_TAB_ACCESS[r] ?? []).includes(tab));
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface DashComment {
  id: number; article_id: number; article_title: string;
  author_name: string; author_id: string;
  content: string; votes: number; is_spam: number; is_featured: number;
  created_at: string;
}

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

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const { news } = useAppContext();
  const [dashboard, setDashboard] = useState<{
    stats: { articles: number; drafts: number; comments: number; spam_comments: number; ads_active: number; ads_total: number; banned_users: number };
    daily_activity: { date: string; count: number }[];
    articles_this_week: number;
  } | null>(null);

  useEffect(() => {
    apiGetDashboard().then(setDashboard).catch(() => setDashboard(null));
  }, []);

  const stats = dashboard?.stats || { articles: 0, drafts: 0, comments: 0, spam_comments: 0, ads_active: 0, ads_total: 0, banned_users: 0 };
  const dailyActivity = dashboard?.daily_activity || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Newspaper, label: 'Articles', value: stats.articles, color: 'bg-blue-500' },
          { icon: MessageSquare, label: 'Comments', value: stats.comments, color: 'bg-teal-500' },
          { icon: Megaphone, label: 'Active Ads', value: stats.ads_active, color: 'bg-purple-500' },
          { icon: BarChart2, label: 'This Week', value: dashboard?.articles_this_week ?? stats.articles, color: 'bg-blue-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white dark:bg-[#141414] rounded-xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shadow-sm shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-vibrant-text dark:text-white">{value}</p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Activity chart */}
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-100 dark:border-white/5 p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Daily Activity</h3>
          <div className="flex items-end gap-2 h-24">
            {dailyActivity.length > 0 ? dailyActivity.map((d, i) => {
              const maxCount = Math.max(...dailyActivity.map(x => x.count), 1);
              const height = (d.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-gray-400 font-bold">{d.count}</span>
                  <div className="w-full bg-blue-100 dark:bg-blue-900/20 rounded relative" style={{ height: `${Math.max(height, 10)}%` }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 dark:bg-blue-600 rounded transition-all" style={{ height: `${height}%` }} />
                  </div>
                  <span className="text-[7px] text-gray-400">{d.date.slice(5)}</span>
                </div>
              );
            }) : (
              <div className="w-full flex items-center justify-center text-gray-400 text-xs py-6">No data</div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-100 dark:border-white/5 p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onTabChange('news')} className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
              <Newspaper className="w-4 h-4" /> New Article
            </button>
            <button onClick={() => onTabChange('comments')} className="flex items-center gap-2 p-3 rounded-lg bg-teal-50 dark:bg-teal-900/10 text-teal-700 dark:text-teal-300 text-sm font-bold hover:bg-teal-100 dark:hover:bg-teal-900/20 transition-colors">
              <MessageSquare className="w-4 h-4" /> Moderation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── News ─────────────────────────────────────────────────────────────────────

function NewsTab() {
  const { news, updateNews, deleteNews, isAdmin } = useAppContext();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(news.map(n => n.category)))];
  const filtered = useMemo(() => news.filter(n => {
    const matchCat = catFilter === 'All' || n.category === catFilter;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [news, search, catFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-vibrant-text dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-2 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-blue-700 active:scale-95 transition-all">
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      <p className="text-[10px] text-gray-400 font-bold">{filtered.length} of {news.length} articles</p>

      <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Article</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n, i) => (
                <tr key={n.id} className={`border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-white/[0.01]'}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <img src={n.imageUrl} alt="" className="w-7 h-7 rounded object-cover shrink-0 hidden sm:block" />
                      <p className="font-bold text-vibrant-text dark:text-white text-sm line-clamp-1 max-w-[220px]">{n.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell"><span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{n.category}</span></td>
                  <td className="px-4 py-2.5 hidden lg:table-cell"><span className="text-[11px] text-gray-400">{n.date}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {n.isFeatured && <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded">Featured</span>}
                      {n.isBreaking && <span className="text-[9px] font-bold uppercase bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">Breaking</span>}
                      <button onClick={() => updateNews(n.id, { isFeatured: !n.isFeatured })}
                        className={`p-1 rounded transition-colors ${n.isFeatured ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}>
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => updateNews(n.id, { isBreaking: !n.isBreaking })}
                        className={`p-1 rounded transition-colors ${n.isBreaking ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}>
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditItem(n)}
                        className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => isAdmin && setConfirmDelete(n.id)} disabled={!isAdmin} title={isAdmin ? 'Delete' : 'Admin only'}
                        className={`p-1 rounded transition-colors ${isAdmin ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30'}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">No articles match.</div>}
        </div>
      </div>

      <AdminCreatePost isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <EditNewsModal item={editItem} onClose={() => setEditItem(null)} />
      <ConfirmDialog open={!!confirmDelete} title="Delete Article" message="This will permanently remove the article."
        onConfirm={() => { if (confirmDelete) { deleteNews(confirmDelete); setConfirmDelete(null); } }} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

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
          className="relative w-full max-w-2xl bg-white dark:bg-[#141414] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#141414] z-10">
            <h2 className="text-base font-bold text-vibrant-text dark:text-white">Edit Article</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {[
              { label: 'Title', key: 'title', placeholder: 'Article title' },
              { label: 'Excerpt', key: 'excerpt', placeholder: 'Brief summary...' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">{label}</label>
                <input value={form[key as keyof typeof form] as string || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Content</label>
              <textarea value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={5}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Image URL</label>
              <input value={form.imageUrl || ''} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Category</label>
              <input value={form.category || ''} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Politics, Tech"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={!!form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs font-bold text-vibrant-text dark:text-white">Featured</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={!!form.isBreaking} onChange={e => setForm(p => ({ ...p, isBreaking: e.target.checked }))}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs font-bold text-vibrant-text dark:text-white">Breaking</span>
              </label>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Tags (comma-separated)</label>
              <input value={Array.isArray(form.tags) ? form.tags.join(', ') : ''} onChange={e => setForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} placeholder="tag1, tag2, tag3"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div className="p-5 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a] flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 active:scale-95 transition-all">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Ads ──────────────────────────────────────────────────────────────────────

function AdsTab() {
  const { ads, updateAd, deleteAd, isAdmin } = useAppContext();
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-400 font-bold">{ads.length} advertisements</p>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-blue-700 active:scale-95 transition-all">
          <Plus className="w-3.5 h-3.5" /> New Ad
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ads.map(ad => (
          <div key={ad.id} className="bg-white dark:bg-[#141414] rounded-xl border border-gray-100 dark:border-white/5 p-4">
            <div className="flex items-start justify-between mb-2.5">
              <div>
                <p className="font-bold text-vibrant-text dark:text-white text-sm">{ad.title}</p>
                <p className="text-[10px] text-gray-400">{ad.placement} · {ad.type}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${ad.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500'}`}>
                {ad.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {ad.imageUrl && <img src={ad.imageUrl} alt="" className="w-full h-20 object-cover rounded-lg mb-2.5" />}
            <div className="flex items-center gap-1.5">
              <button onClick={() => updateAd(ad.id, { isActive: !ad.isActive })}
                className={`p-1.5 rounded transition-colors ${ad.isActive ? 'text-green-600 bg-green-100 dark:bg-green-900/20' : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10'}`}>
                {ad.isActive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => isAdmin && setConfirmDelete(ad.id)} disabled={!isAdmin} title={isAdmin ? 'Delete' : 'Admin only'}
                className={`p-1.5 rounded transition-colors ${isAdmin ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30'}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {ads.length === 0 && <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">No ads yet.</div>}
      <AdminManageAds isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <ConfirmDialog open={!!confirmDelete} title="Delete Advertisement" message="This will permanently remove the ad."
        onConfirm={() => { if (confirmDelete) { deleteAd(confirmDelete); setConfirmDelete(null); } }} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

// ─── Comments ─────────────────────────────────────────────────────────────────

function CommentsTab() {
  const { bannedUserIds, banUser, unbanUser, isAdmin } = useAppContext();
  const [comments, setComments] = useState<DashComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'spam' | 'featured'>('all');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    apiGetDashboard().then(data => setComments(data.recent_comments as DashComment[])).catch(() => setComments([])).finally(() => setLoading(false));
  }, []);

  const filtered = comments.filter(c => {
    if (filter === 'spam') return Boolean(c.is_spam);
    if (filter === 'featured') return Boolean(c.is_featured);
    return true;
  });

  const toggleSpam = async (c: DashComment) => {
    const next = c.is_spam ? 0 : 1;
    setComments(prev => prev.map(x => x.id === c.id ? { ...x, is_spam: next } : x));
    try { await apiUpdateComment(c.id, { is_spam: next }); } catch {}
  };
  const toggleFeatured = async (c: DashComment) => {
    const next = c.is_featured ? 0 : 1;
    setComments(prev => prev.map(x => x.id === c.id ? { ...x, is_featured: next } : x));
    try { await apiUpdateComment(c.id, { is_featured: next }); } catch {}
  };
  const handleBan = async (userId: string) => { banUser(userId); try { await apiBanUser(userId); } catch {} };
  const handleUnban = async (userId: string) => { unbanUser(userId); try { await apiUnbanUser(userId); } catch {} };
  const deleteComment = async (id: number) => {
    setComments(prev => prev.filter(c => c.id !== id));
    try { await apiDeleteComment(id); } catch {}
    setConfirmDelete(null);
  };

  if (loading) return <div className="flex items-center justify-center py-12 text-gray-400 gap-2"><RefreshCw className="w-4 h-4 animate-spin" /><span className="text-sm">Loading...</span></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        {(['all', 'spam', 'featured'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-blue-500/30'}`}>
            {f} {f === 'spam' && `(${comments.filter(c => c.is_spam).length})`}
            {f === 'featured' && `(${comments.filter(c => c.is_featured).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(c => (
          <div key={c.id} className={`bg-white dark:bg-[#141414] rounded-xl border p-4 transition-colors ${c.is_spam ? 'border-red-200 dark:border-red-900/30' : 'border-gray-100 dark:border-white/5'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-sm font-bold text-vibrant-text dark:text-white">{c.author_name}</span>
                  {Boolean(c.is_spam) && <span className="text-[9px] font-bold uppercase bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">Spam</span>}
                  {Boolean(c.is_featured) && <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded">Featured</span>}
                  {c.author_id && bannedUserIds.includes(c.author_id) && <span className="text-[9px] font-bold uppercase bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded">Banned</span>}
                </div>
                <p className="text-[11px] text-gray-400 mb-1.5">On: <span className="font-bold text-gray-500 dark:text-gray-400">{c.article_title}</span> · {new Date(c.created_at).toLocaleDateString()} · {c.votes} votes</p>
                <p className="text-sm text-vibrant-text dark:text-gray-300 leading-relaxed">{c.content}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => toggleFeatured(c)}
                  className={`p-1.5 rounded transition-colors ${c.is_featured ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}>
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => toggleSpam(c)}
                  className={`p-1.5 rounded transition-colors ${c.is_spam ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>
                {(isAdmin || c.author_id) && !bannedUserIds.includes(c.author_id) && (
                  <button onClick={() => isAdmin && handleBan(c.author_id)} disabled={!isAdmin} title={isAdmin ? 'Ban user' : 'Admin only'}
                    className={`p-1.5 rounded transition-colors ${isAdmin ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30'}`}>
                    <ShieldBan className="w-3.5 h-3.5" />
                  </button>
                )}
                {(isAdmin || c.author_id) && bannedUserIds.includes(c.author_id) && (
                  <button onClick={() => isAdmin && handleUnban(c.author_id)} disabled={!isAdmin} title={isAdmin ? 'Unban user' : 'Admin only'}
                    className={`p-1.5 rounded transition-colors ${isAdmin ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/20' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => isAdmin && setConfirmDelete(c.id)} disabled={!isAdmin} title={isAdmin ? 'Delete' : 'Admin only'}
                  className={`p-1.5 rounded transition-colors ${isAdmin ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30'}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">No comments.</div>}
      </div>

      <ConfirmDialog open={confirmDelete !== null} title="Delete Comment" message="This will permanently remove the comment."
        onConfirm={() => { if (confirmDelete !== null) deleteComment(confirmDelete); }} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateProfile } = useAppContext();
  const [form, setForm] = useState({
    name: user?.name ?? '', bio: user?.bio ?? '',
    avatarUrl: user?.avatarUrl ?? '', twitterUrl: user?.twitterUrl ?? '', linkedinUrl: user?.linkedinUrl ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => { setSaving(true); updateProfile(form); setTimeout(() => setSaving(false), 600); };

  return (
    <div className="max-w-lg space-y-4">
      <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-100 dark:border-white/5 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Edit Your Profile</h3>
        {[
          { label: 'Display Name', key: 'name', placeholder: 'Your name' },
          { label: 'Bio', key: 'bio', placeholder: 'A short bio...', textarea: true },
          { label: 'Avatar URL', key: 'avatarUrl', placeholder: 'https://...' },
          { label: 'Twitter URL', key: 'twitterUrl', placeholder: 'https://twitter.com/...' },
          { label: 'LinkedIn URL', key: 'linkedinUrl', placeholder: 'https://linkedin.com/in/...' },
        ].map(({ label, key, placeholder, textarea }) => (
          <div key={key}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">{label}</label>
            {textarea ? (
              <textarea value={form[key as keyof typeof form] as string} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} rows={3} placeholder={placeholder}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            ) : (
              <input value={form[key as keyof typeof form] as string} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            )}
          </div>
        ))}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60">
          {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TAB_CONFIG: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview',       icon: LayoutDashboard },
  { id: 'news',     label: 'Articles',        icon: Newspaper },
  { id: 'ads',      label: 'Advertisements',  icon: Megaphone },
  { id: 'comments', label: 'Moderation',      icon: MessageSquare },
  { id: 'profile',  label: 'Profile',         icon: User },
];

const URL_TO_TAB: Record<string, Tab> = {
  dashboard: 'overview', overview: 'overview',
  news: 'news', articles: 'news', write: 'news',
  ads: 'ads', advertisements: 'ads',
  comments: 'comments', moderation: 'comments',
  profile: 'profile',
};

const TAB_TO_URL: Record<Tab, string> = {
  overview: 'dashboard', news: 'write', ads: 'ads', comments: 'moderation', profile: 'profile',
};

// ─── Staff Login Screen ───────────────────────────────────────────────────────

function StaffLoginScreen() {
  const { loginStaff } = useAppContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      const ok = await loginStaff(username, password);
      if (ok) {
        navigate('/staff/dashboard', { replace: true });
      } else {
        setError(true);
        setPassword('');
        setTimeout(() => setError(false), 2500);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Staff Portal</h1>
            <p className="text-blue-200 text-sm mt-1">JM News Content Management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-sm font-bold text-vibrant-text dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-sm font-bold text-vibrant-text dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs font-bold text-center"
              >
                Invalid username or password
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Authorizing…
                </span>
              ) : (
                'Authorize'
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/" className="text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors">
                ← Back to Homepage
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function StaffDashboard() {
  const { user, logout } = useAppContext();

  // Auth gate — show staff login if not authenticated
  if (!user) return <StaffLoginScreen />;
  const { tab: urlTab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>(() => URL_TO_TAB[urlTab ?? ''] || 'overview');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userRoles = user?.staffRoles ?? (user?.staffRole ? [user.staffRole] : []);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  // Sync URL → tab
  useEffect(() => {
    const mapped = URL_TO_TAB[urlTab ?? ''];
    if (mapped && mapped !== activeTab) setActiveTab(mapped);
  }, [urlTab]);

  // Sync tab → URL
  const lastTabRef = useRef(activeTab);
  useEffect(() => {
    if (lastTabRef.current !== activeTab) {
      lastTabRef.current = activeTab;
      const url = TAB_TO_URL[activeTab];
      if (url) navigate(`/staff/${url}`, { replace: true });
    }
  }, [activeTab, navigate]);

  const handleTabChange = (tab: Tab) => { setActiveTab(tab); };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab onTabChange={handleTabChange} />;
      case 'news':     return <NewsTab />;
      case 'ads':      return <AdsTab />;
      case 'comments': return <CommentsTab />;
      case 'profile':  return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* ── Top navigation bar ── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                <Newspaper className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-vibrant-text dark:text-white hidden sm:inline">JM News</span>
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

            {/* STAFF badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">STAFF</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Tab nav — pills */}
            <nav className="hidden md:flex items-center gap-1">
              {TAB_CONFIG.map(tab => {
                const Icon = tab.icon;
                const hasAccess = tab.id === 'profile' || hasRoleAccess(userRoles, tab.id);
                const active = activeTab === tab.id;
                const tabUrl = TAB_TO_URL[tab.id];

                if (!hasAccess) {
                  return (
                    <div key={tab.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-30 blur-[0.5px] select-none"
                      title="Not available for your role">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">{tab.label}</span>
                    </div>
                  );
                }

                return (
                  <Link key={tab.id} to={`/staff/${tabUrl}`} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-vibrant-text dark:hover:text-white'
                    }`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile tab indicator */}
            <span className="md:hidden text-xs font-bold text-vibrant-text dark:text-white truncate">
              {TAB_CONFIG.find(t => t.id === activeTab)?.label}
            </span>

            {/* Spacer */}
            <div className="flex-1 md:hidden" />

            {/* User avatar / dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu(p => !p)}
                className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                <span className="text-blue-700 dark:text-blue-300 font-bold text-xs uppercase">{user?.name?.[0] ?? 'S'}</span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                      <p className="text-xs font-bold text-vibrant-text dark:text-white truncate">{user?.name}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {(user?.staffRoles ?? [user?.staffRole]).filter(Boolean).join(', ') || 'Staff'}
                      </p>
                    </div>
                    <div className="p-1">
                      <button onClick={() => { setShowUserMenu(false); handleTabChange('profile'); navigate('/staff/profile', { replace: true }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-vibrant-text dark:hover:text-white transition-colors text-left">
                        <User className="w-3.5 h-3.5" /> My Profile
                      </button>
                      <Link to="/"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-vibrant-text dark:hover:text-white transition-colors">
                        <Home className="w-3.5 h-3.5" /> Homepage
                      </Link>
                      <button onClick={() => { setShowUserMenu(false); logout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile tab bar ── */}
      <div className="md:hidden bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/10 px-2 py-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center gap-1">
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            const hasAccess = tab.id === 'profile' || hasRoleAccess(userRoles, tab.id);
            const active = activeTab === tab.id;
            const tabUrl = TAB_TO_URL[tab.id];

            if (!hasAccess) {
              return (
                <div key={tab.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-gray-300 dark:text-gray-600 opacity-30 blur-[0.5px] select-none cursor-not-allowed">
                  <Icon className="w-3 h-3" /> {tab.label}
                </div>
              );
            }

            return (
              <Link key={tab.id} to={`/staff/${tabUrl}`} onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-bold transition-all whitespace-nowrap ${
                  active ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}>
                <Icon className="w-3 h-3" /> {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Page content ── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
          {renderTab()}
        </motion.div>
      </main>
    </div>
  );
}
