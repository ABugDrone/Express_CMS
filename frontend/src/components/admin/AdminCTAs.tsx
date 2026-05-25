import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Megaphone } from 'lucide-react';
import { apiGetAllCTAElements, apiCreateCTAElement, apiUpdateCTAElement, apiDeleteCTAElement } from '../../lib/api';

interface CTAForm {
  id?: number;
  label: string;
  text: string;
  link: string;
  placement: string;
  sort_order: number;
  is_active: number;
}

const PLACEMENTS = ['sidebar', 'footer', 'header', 'inline', 'popup'];
interface AdminCTAsProps {
  editId?: string;
  action?: string;
}

const emptyForm: CTAForm = { label: '', text: '', link: '', placement: 'sidebar', sort_order: 0, is_active: 1 };

export default function AdminCTAs({ editId: urlEditId }: AdminCTAsProps) {
  const [ctas, setCtas] = useState<CTAForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CTAForm | null>(null);
  const [form, setForm] = useState<CTAForm>(emptyForm);
  const [message, setMessage] = useState('');

  useEffect(() => { loadCTAs(); }, []);

  // Handle URL query params for edit targeting
  useEffect(() => {
    if (!urlEditId || !ctas.length) return;
    const target = ctas.find(c => String(c.id) === urlEditId);
    if (target) {
      setEditing(target);
      setForm(target);
    }
  }, [urlEditId, ctas]);

  const loadCTAs = () => {
    apiGetAllCTAElements()
      .then(setCtas)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSubmit = async () => {
    if (!form.label) { setMessage('Label is required'); return; }
    try {
      if (editing?.id) {
        await apiUpdateCTAElement(editing.id, form);
        setMessage('CTA updated');
      } else {
        await apiCreateCTAElement(form);
        setMessage('CTA created');
      }
      setForm(emptyForm);
      setEditing(null);
      loadCTAs();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Operation failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this CTA element?')) return;
    try {
      await apiDeleteCTAElement(id);
      setMessage('CTA deleted');
      loadCTAs();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Delete failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Call-to-Action Elements</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage CTA buttons, banners, and promotional elements</p>
        </div>
      </div>

      {message && <div className="p-3 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200">{message}</div>}

      <div className="p-4 border border-gray-200 dark:border-white/10 rounded-lg space-y-3 bg-gray-50 dark:bg-white/5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input type="text" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Label" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
          <input type="text" value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} placeholder="Description text" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
          <input type="url" value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="Target URL" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={form.placement} onChange={e => setForm(p => ({ ...p, placement: e.target.value }))} className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white">
            {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} placeholder="Order" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={form.is_active === 1} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked ? 1 : 0 }))} className="rounded" /> Active
          </label>
          <div className="flex items-center gap-2">
            <button onClick={handleSubmit} className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700"><Save className="w-4 h-4" /> {editing?.id ? 'Update' : 'Save'}</button>
            <button onClick={() => { setEditing(null); setForm(emptyForm); }} className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-white/10 text-sm font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-white/15"><X className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {ctas.map(c => (
          <div key={c.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600"><Megaphone className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{c.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.text || 'No description'} · <span className="capitalize">{c.placement}</span></p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.is_active ? 'Active' : 'Hidden'}</span>
            <button onClick={() => { setEditing(c); setForm(c); }} className="p-1.5 text-gray-400 hover:text-amber-600"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
