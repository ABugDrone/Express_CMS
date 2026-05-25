import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Layout, Code, Type, Image as ImageIcon, Video, Link2 } from 'lucide-react';
import { apiGetAllPageElements, apiCreatePageElement, apiUpdatePageElement, apiDeletePageElement } from '../../lib/api';

interface ElementForm {
  id?: number;
  key: string;
  type: string;
  placement: string;
  content: string;
  sort_order: number;
  is_active: number;
}

const ELEMENT_TYPES = [
  { value: 'html', label: 'HTML Block', icon: <Code className="w-4 h-4" /> },
  { value: 'text', label: 'Text Block', icon: <Type className="w-4 h-4" /> },
  { value: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
  { value: 'video', label: 'Video Embed', icon: <Video className="w-4 h-4" /> },
  { value: 'link', label: 'Link/Button', icon: <Link2 className="w-4 h-4" /> },
  { value: 'script', label: 'Script/Ad Code', icon: <Code className="w-4 h-4" /> },
  { value: 'separator', label: 'Separator', icon: <Layout className="w-4 h-4" /> },
  { value: 'spacer', label: 'Spacer', icon: <Layout className="w-4 h-4" /> },
];

const PLACEMENTS = ['header', 'footer', 'sidebar-left', 'sidebar-right', 'content-top', 'content-bottom', 'between-articles', 'homepage-hero', 'article-top', 'article-bottom', 'custom'];

const emptyForm: ElementForm = { key: '', type: 'html', placement: 'custom', content: '', sort_order: 0, is_active: 1 };

export default function AdminPageElements() {
  const [elements, setElements] = useState<ElementForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ElementForm | null>(null);
  const [form, setForm] = useState<ElementForm>(emptyForm);
  const [message, setMessage] = useState('');

  useEffect(() => { loadElements(); }, []);

  const loadElements = () => {
    apiGetAllPageElements()
      .then(setElements)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSubmit = async () => {
    if (!form.key || !form.type || !form.placement || !form.content) { setMessage('Key, type, placement, and content are required'); return; }
    try {
      if (editing?.id) {
        await apiUpdatePageElement(editing.id, form);
        setMessage('Element updated');
      } else {
        await apiCreatePageElement(form);
        setMessage('Element created');
      }
      setForm(emptyForm);
      setEditing(null);
      loadElements();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) { setMessage(err?.message || 'Operation failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this page element?')) return;
    try {
      await apiDeletePageElement(id);
      setMessage('Element deleted');
      loadElements();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Delete failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>;

  const getTypeIcon = (type: string) => ELEMENT_TYPES.find(t => t.value === type)?.icon || <Layout className="w-4 h-4" />;
  const getTypeLabel = (type: string) => ELEMENT_TYPES.find(t => t.value === type)?.label || type;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Page Elements (CMD)</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Command-style customization. Add any element to any placement on the site.</p>
        </div>
      </div>

      {message && <div className="p-3 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200">{message}</div>}

      <div className="p-4 border border-gray-200 dark:border-white/10 rounded-lg space-y-3 bg-gray-50 dark:bg-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input type="text" value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50) }))} placeholder="Unique key (e.g. hero-banner)" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white">
            {ELEMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={form.placement} onChange={e => setForm(p => ({ ...p, placement: e.target.value }))} className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white">
            {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} placeholder="Order" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
        </div>
        <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Element content (HTML, text, URL, embed code, etc.)" rows={4} className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white font-mono resize-none" />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={form.is_active === 1} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked ? 1 : 0 }))} className="rounded" /> Active
          </label>
          <button onClick={handleSubmit} className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700"><Save className="w-4 h-4" /> {editing?.id ? 'Update' : 'Save'}</button>
          <button onClick={() => { setEditing(null); setForm(emptyForm); }} className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-white/10 text-sm font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-white/15"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Grouped by placement */}
      {Array.from(new Set(elements.map(e => e.placement))).map(placement => (
        <div key={placement} className="space-y-2">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <Layout className="w-4 h-4" /> {placement}
          </h3>
          <div className="space-y-2">
            {elements.filter(e => e.placement === placement).sort((a, b) => a.sort_order - b.sort_order).map(el => (
              <div key={el.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 shrink-0">
                  {getTypeIcon(el.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">{el.key}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-500 rounded">{getTypeLabel(el.type)}</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono line-clamp-2 break-all">{el.content}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${el.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{el.is_active ? 'On' : 'Off'}</span>
                <button onClick={() => { setEditing(el); setForm(el); }} className="p-1.5 text-gray-400 hover:text-amber-600 shrink-0"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(el.id)} className="p-1.5 text-gray-400 hover:text-red-600 shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {elements.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Layout className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-bold">No page elements yet</p>
          <p className="text-xs mt-1">Add elements to customize any part of your site</p>
        </div>
      )}
    </div>
  );
}
