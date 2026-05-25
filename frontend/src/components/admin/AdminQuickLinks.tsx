import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Link2, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { apiGetAllQuickLinks, apiCreateQuickLink, apiUpdateQuickLink, apiDeleteQuickLink, apiGetAllLegalPages, apiCreateLegalPage, apiUpdateLegalPage, apiDeleteLegalPage, apiGetAllContactInfo, apiCreateContactInfo, apiUpdateContactInfo, apiDeleteContactInfo } from '../../lib/api';

type TabType = 'links' | 'legal' | 'contact';

interface QuickLink { id: number; label: string; url: string; group: string; icon: string; sort_order: number; is_active: number; created_at: string; }
interface LegalPage { id: number; slug: string; title: string; content: string; sort_order: number; is_active: number; created_at: string; }
interface ContactInfo { id: number; type: string; label: string; value: string; icon: string; sort_order: number; is_active: number; created_at: string; }

const GROUPS = ['footer', 'legal', 'extra', 'header', 'sidebar'];
const CONTACT_TYPES = ['email', 'phone', 'address', 'fax', 'website'];

interface AdminQuickLinksProps {
  editId?: string;
  action?: string;
}

export default function AdminQuickLinks({ editId: urlEditId }: AdminQuickLinksProps) {
  const [activeTab, setActiveTab] = useState<TabType>('links');
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [legal, setLegal] = useState<LegalPage[]>([]);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkForm, setLinkForm] = useState<Partial<QuickLink>>({ group: 'footer', is_active: 1, sort_order: 0 });
  const [legalForm, setLegalForm] = useState<Partial<LegalPage>>({ is_active: 1, sort_order: 0 });
  const [contactForm, setContactForm] = useState<Partial<ContactInfo>>({ type: 'email', is_active: 1, sort_order: 0 });
  const [editingLink, setEditingLink] = useState<number | null>(null);
  const [editingLegal, setEditingLegal] = useState<number | null>(null);
  const [editingContact, setEditingContact] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    Promise.all([apiGetAllQuickLinks(), apiGetAllLegalPages(), apiGetAllContactInfo()])
      .then(([l, p, c]) => { setLinks(l); setLegal(p); setContacts(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Quick Links CRUD
  const handleLinkSubmit = async () => {
    if (!linkForm.label || !linkForm.url) { setMessage('Label and URL required'); return; }
    try {
      if (editingLink) { await apiUpdateQuickLink(editingLink, linkForm); setMessage('Link updated'); }
      else { await apiCreateQuickLink(linkForm); setMessage('Link created'); }
      setLinkForm({ group: 'footer', is_active: 1, sort_order: 0 }); setEditingLink(null); loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Operation failed'); }
  };

  // Legal Pages CRUD
  const handleLegalSubmit = async () => {
    if (!legalForm.title || !legalForm.content) { setMessage('Title and content required'); return; }
    try {
      if (editingLegal) { await apiUpdateLegalPage(editingLegal, legalForm); setMessage('Page updated'); }
      else { await apiCreateLegalPage({ title: legalForm.title!, content: legalForm.content!, sort_order: legalForm.sort_order, is_active: legalForm.is_active }); setMessage('Page created'); }
      setLegalForm({ is_active: 1, sort_order: 0 }); setEditingLegal(null); loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Operation failed'); }
  };

  // Contact Info CRUD
  const handleContactSubmit = async () => {
    if (!contactForm.type || !contactForm.label || !contactForm.value) { setMessage('Type, label, and value required'); return; }
    try {
      if (editingContact) { await apiUpdateContactInfo(editingContact, contactForm); setMessage('Contact updated'); }
      else { await apiCreateContactInfo({ type: contactForm.type!, label: contactForm.label!, value: contactForm.value!, icon: contactForm.icon, sort_order: contactForm.sort_order, is_active: contactForm.is_active }); setMessage('Contact created'); }
      setContactForm({ type: 'email', is_active: 1, sort_order: 0 }); setEditingContact(null); loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Operation failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>;

  const tabs: { key: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'links', label: 'Quick Links', icon: <Link2 className="w-4 h-4" />, count: links.length },
    { key: 'legal', label: 'Legal Pages', icon: <FileText className="w-4 h-4" />, count: legal.length },
    { key: 'contact', label: 'Contact Info', icon: <Mail className="w-4 h-4" />, count: contacts.length },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Navigation & Content</h2>
      {message && <div className="p-3 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200">{message}</div>}

      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === t.key ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t.icon} {t.label} <span className="text-xs bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Quick Links */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-white/10 rounded-lg space-y-3 bg-gray-50 dark:bg-white/5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input type="text" value={linkForm.label || ''} onChange={e => setLinkForm(p => ({ ...p, label: e.target.value }))} placeholder="Label" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
              <input type="url" value={linkForm.url || ''} onChange={e => setLinkForm(p => ({ ...p, url: e.target.value }))} placeholder="URL" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
              <select value={linkForm.group || 'footer'} onChange={e => setLinkForm(p => ({ ...p, group: e.target.value }))} className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white">
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <input type="number" value={linkForm.sort_order || 0} onChange={e => setLinkForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} placeholder="Order" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
              <button onClick={handleLinkSubmit} className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
          <div className="space-y-2">
            {links.map(l => (
              <div key={l.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{l.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{l.url} · <span className="capitalize">{l.group}</span></p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${l.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{l.is_active ? 'Active' : 'Hidden'}</span>
                <button onClick={() => { setEditingLink(l.id); setLinkForm(l); }} className="p-1.5 text-gray-400 hover:text-amber-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Delete?')) { apiDeleteQuickLink(l.id).then(() => { setMessage('Deleted'); loadData(); setTimeout(() => setMessage(''), 3000); }); } }} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Pages */}
      {activeTab === 'legal' && (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-white/10 rounded-lg space-y-3 bg-gray-50 dark:bg-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" value={legalForm.title || ''} onChange={e => setLegalForm(p => ({ ...p, title: e.target.value }))} placeholder="Page title" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
              <input type="number" value={legalForm.sort_order || 0} onChange={e => setLegalForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} placeholder="Order" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
              <button onClick={handleLegalSubmit} className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700"><Save className="w-4 h-4" /> Save</button>
            </div>
            <textarea value={legalForm.content || ''} onChange={e => setLegalForm(p => ({ ...p, content: e.target.value }))} placeholder="Page content (HTML or plain text)" rows={4} className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white resize-none" />
          </div>
          <div className="space-y-2">
            {legal.map(p => (
              <div key={p.id} className="p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{p.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">/{p.slug} · Order: {p.sort_order}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.is_active ? 'Active' : 'Hidden'}</span>
                    <button onClick={() => { setEditingLegal(p.id); setLegalForm(p); }} className="p-1.5 text-gray-400 hover:text-amber-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm('Delete?')) { apiDeleteLegalPage(p.id).then(() => { setMessage('Deleted'); loadData(); setTimeout(() => setMessage(''), 3000); }); } }} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">{p.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Info */}
      {activeTab === 'contact' && (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-white/10 rounded-lg space-y-3 bg-gray-50 dark:bg-white/5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <select value={contactForm.type || 'email'} onChange={e => setContactForm(p => ({ ...p, type: e.target.value }))} className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white">
                {CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="text" value={contactForm.label || ''} onChange={e => setContactForm(p => ({ ...p, label: e.target.value }))} placeholder="Label" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
              <input type="text" value={contactForm.value || ''} onChange={e => setContactForm(p => ({ ...p, value: e.target.value }))} placeholder="Value" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
              <input type="number" value={contactForm.sort_order || 0} onChange={e => setContactForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} placeholder="Order" className="px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white" />
              <button onClick={handleContactSubmit} className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
          <div className="space-y-2">
            {contacts.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500">
                  {c.type === 'email' ? <Mail className="w-4 h-4" /> : c.type === 'phone' ? <Phone className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{c.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{c.value}</p>
                </div>
                <button onClick={() => { setEditingContact(c.id); setContactForm(c); }} className="p-1.5 text-gray-400 hover:text-amber-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Delete?')) { apiDeleteContactInfo(c.id).then(() => { setMessage('Deleted'); loadData(); setTimeout(() => setMessage(''), 3000); }); } }} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
