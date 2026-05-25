import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, ExternalLink } from 'lucide-react';
import { apiGetAllSocials, apiCreateSocial, apiUpdateSocial, apiDeleteSocial } from '../../lib/api';

const PLATFORM_ICONS = ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 'whatsapp', 'tiktok', 'telegram', 'rss', 'github', 'discord', 'snapchat'];

interface SocialForm {
  id?: number;
  platform: string;
  icon: string;
  url: string;
  label: string;
  sort_order: number;
  is_active: number;
}

interface AdminSocialsProps {
  editId?: string;
  action?: string;
}

const emptyForm: SocialForm = { platform: '', icon: '', url: '', label: '', sort_order: 0, is_active: 1 };

export default function AdminSocials({ editId: urlEditId, action: urlAction }: AdminSocialsProps) {
  const [socials, setSocials] = useState<SocialForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SocialForm | null>(null);
  const [form, setForm] = useState<SocialForm>(emptyForm);
  const [message, setMessage] = useState('');

  useEffect(() => { loadSocials(); }, []);

  // Handle URL query params for edit targeting
  useEffect(() => {
    if (!urlEditId || !socials.length) return;
    const target = socials.find(s => String(s.id) === urlEditId);
    if (target) {
      setEditing(target);
      setForm(target);
    }
  }, [urlEditId, socials]);

  const loadSocials = () => {
    apiGetAllSocials()
      .then(setSocials)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSubmit = async () => {
    if (!form.platform || !form.url) { setMessage('Platform and URL are required'); return; }
    try {
      if (editing?.id) {
        await apiUpdateSocial(editing.id, form);
        setMessage('Social link updated');
      } else {
        await apiCreateSocial(form);
        setMessage('Social link created');
      }
      setForm(emptyForm);
      setEditing(null);
      loadSocials();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Operation failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this social link?')) return;
    try {
      await apiDeleteSocial(id);
      setMessage('Social link deleted');
      loadSocials();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Delete failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Social Media Links</h2>
        <button onClick={() => { setEditing(null); setForm(emptyForm); }} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700">
          <Plus className="w-4 h-4" /> Add Social
        </button>
      </div>

      {message && <div className="p-3 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200">{message}</div>}

      {editing === null && (
        <div className="p-4 border border-gray-200 dark:border-white/10 rounded-lg space-y-3 bg-gray-50 dark:bg-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={form.platform} onChange={e => { setForm(p => ({ ...p, platform: e.target.value, icon: e.target.value })); }} className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white">
              <option value="">Select platform</option>
              {PLATFORM_ICONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="Icon name" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
            <input type="url" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
            <input type="text" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Display label" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
          </div>
          <div className="flex items-center gap-3">
            <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="w-20 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" placeholder="Order" />
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.is_active === 1} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked ? 1 : 0 }))} className="rounded" /> Active
            </label>
            <button onClick={handleSubmit} className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700"><Save className="w-4 h-4" /> Save</button>
            <button onClick={() => setForm(emptyForm)} className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-white/10 text-sm font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-white/15"><X className="w-4 h-4" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {socials.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xs uppercase">{s.icon.slice(0, 2)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{s.platform}</p>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 hover:text-amber-600"><ExternalLink className="w-3 h-3" />{s.url}</a>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.is_active ? 'Active' : 'Hidden'}</span>
            <button onClick={() => { setEditing(s); setForm(s); }} className="p-1.5 text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
