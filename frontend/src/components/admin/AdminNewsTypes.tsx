import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { apiGetNewsTypes, apiCreateNewsType, apiUpdateNewsType, apiDeleteNewsType } from '../../lib/api';

interface NewsTypeForm {
  id?: number;
  name: string;
  slug?: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: number;
  is_standalone: number;
}

interface AdminNewsTypesProps {
  editId?: string;
  action?: string;
}

const emptyForm: NewsTypeForm = { name: '', description: '', icon: '', sort_order: 0, is_active: 1, is_standalone: 0 };

export default function AdminNewsTypes({ editId: urlEditId, action: urlAction }: AdminNewsTypesProps) {
  const [types, setTypes] = useState<NewsTypeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsTypeForm | null>(null);
  const [form, setForm] = useState<NewsTypeForm>(emptyForm);
  const [message, setMessage] = useState('');

  useEffect(() => { loadTypes(); }, []);

  // Handle URL query params for edit targeting
  useEffect(() => {
    if (!urlEditId || !types.length) return;
    const target = types.find(t => String(t.id) === urlEditId);
    if (target) {
      setEditing(target);
      setForm(target);
    }
  }, [urlEditId, types]);

  const loadTypes = () => {
    apiGetNewsTypes()
      .then(setTypes)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSubmit = async () => {
    if (!form.name || form.name.length < 2) { setMessage('Name must be at least 2 characters'); return; }
    try {
      if (editing?.id) {
        await apiUpdateNewsType(editing.id, form);
        setMessage('News type updated');
      } else {
        await apiCreateNewsType(form);
        setMessage('News type created');
      }
      setForm(emptyForm);
      setEditing(null);
      loadTypes();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) { setMessage(err?.message || 'Operation failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this news type? Articles using it will be set to null.')) return;
    try {
      await apiDeleteNewsType(id);
      setMessage('News type deleted');
      loadTypes();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Delete failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">News Types</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage standalone news categories. Articles reference these types.</p>
        </div>
      </div>

      {message && <div className="p-3 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200">{message}</div>}

      {(editing === null || editing?.id) && (
        <div className="p-4 border border-gray-200 dark:border-white/10 rounded-lg space-y-3 bg-gray-50 dark:bg-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Type name" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
            <input type="text" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="Icon (lucide name)" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
            <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} placeholder="Sort order" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.is_active === 1} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked ? 1 : 0 }))} className="rounded" /> Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.is_standalone === 1} onChange={e => setForm(p => ({ ...p, is_standalone: e.target.checked ? 1 : 0 }))} className="rounded" /> Standalone
            </label>
            <button onClick={handleSubmit} className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700"><Save className="w-4 h-4" /> {editing?.id ? 'Update' : 'Save'}</button>
            <button onClick={() => { setEditing(null); setForm(emptyForm); }} className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-white/10 text-sm font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-white/15"><X className="w-4 h-4" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {types.map(t => (
          <div key={t.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 font-bold text-xs">{t.icon ? t.icon.slice(0, 2).toUpperCase() : t.name.slice(0, 2).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</p>
                {t.is_standalone === 1 && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">Standalone</span>}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.description || 'No description'} · {t.article_count || 0} articles</p>
            </div>
            <span className={`p-1 rounded ${t.is_active ? 'text-green-600' : 'text-gray-400'}`}>{t.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</span>
            <button onClick={() => { setEditing(t); setForm(t); }} className="p-1.5 text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
