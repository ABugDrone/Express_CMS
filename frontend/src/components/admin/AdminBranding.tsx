import { useState, useEffect } from 'react';
import { Upload, X, Save, Image as ImageIcon, Type, Globe, Palette, Loader2 } from 'lucide-react';
import { apiGetAllSiteSettings, apiUpdateSiteSettings, apiUploadFile } from '../../lib/api';
import type { UploadContext } from '../../lib/api';

interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'image' | 'textarea';
  icon: React.ReactNode;
  description: string;
}

const SETTING_FIELDS: SettingField[] = [
  { key: 'site_name', label: 'Site Name', type: 'text', icon: <Type className="w-4 h-4" />, description: 'Display name shown in header and browser title' },
  { key: 'site_tagline', label: 'Tagline', type: 'text', icon: <Type className="w-4 h-4" />, description: 'Short description below the site name' },
  { key: 'site_logo_url', label: 'Logo URL', type: 'image', icon: <ImageIcon className="w-4 h-4" />, description: 'Main news logo (upload or paste URL)' },
  { key: 'site_favicon_url', label: 'Favicon URL', type: 'image', icon: <ImageIcon className="w-4 h-4" />, description: 'Browser tab icon (32x32 recommended)' },
  { key: 'site_email', label: 'Contact Email', type: 'email', icon: <Globe className="w-4 h-4" />, description: 'Public contact email address' },
  { key: 'site_phone', label: 'Contact Phone', type: 'text', icon: <Globe className="w-4 h-4" />, description: 'Public contact phone number' },
  { key: 'site_address', label: 'Address', type: 'text', icon: <Globe className="w-4 h-4" />, description: 'Physical address shown in footer' },
  { key: 'footer_copyright', label: 'Footer Copyright', type: 'text', icon: <Type className="w-4 h-4" />, description: 'Copyright text in footer' },
  { key: 'newsletter_title', label: 'Newsletter Title', type: 'text', icon: <Palette className="w-4 h-4" />, description: 'Newsletter section heading' },
  { key: 'newsletter_description', label: 'Newsletter Description', type: 'text', icon: <Palette className="w-4 h-4" />, description: 'Newsletter section subtitle' },
  { key: 'whatsapp_channel_url', label: 'WhatsApp Channel', type: 'url', icon: <Globe className="w-4 h-4" />, description: 'Link to WhatsApp channel' },
  { key: 'paper_edition_url', label: 'Paper Edition URL', type: 'url', icon: <Globe className="w-4 h-4" />, description: 'Link to download paper edition' },
];

export default function AdminBranding() {
  const [settings, setSettings] = useState<Record<string, { value: string; type: string; description: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiGetAllSiteSettings()
      .then(res => {
        const map: Record<string, any> = {};
        res.forEach(s => { map[s.key] = { value: s.value, type: s.type, description: s.description }; });
        setSettings(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload: Record<string, any> = {};
      for (const field of SETTING_FIELDS) {
        payload[field.key] = { value: settings[field.key]?.value ?? '', type: field.type };
      }
      await apiUpdateSiteSettings(payload);
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(key);
    try {
      const ctx = key.includes('logo') ? 'news_image' : 'profile' as UploadContext;
      const res = await apiUploadFile(file, ctx);
      setSettings(prev => ({ ...prev, [key]: { ...prev[key], value: res.url } }));
    } catch {
      setMessage('Upload failed');
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Site Branding & Settings</h2>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-bold ${message.includes('Failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SETTING_FIELDS.map(field => {
          const value = settings[field.key]?.value ?? '';
          return (
            <div key={field.key} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                {field.icon} {field.label}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">{field.description}</p>
              {field.type === 'image' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={value}
                    onChange={e => setSettings(prev => ({ ...prev, [field.key]: { ...prev[field.key], value: e.target.value } }))}
                    placeholder="Paste image URL or upload below"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/10 text-xs font-bold rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">
                      <Upload className="w-3 h-3" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleImageUpload(field.key, e.target.files[0]); }} />
                    </label>
                    {uploading === field.key && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
                  </div>
                  {value && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <img src={value} alt={field.label} className="max-h-20 object-contain rounded" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={value}
                  onChange={e => setSettings(prev => ({ ...prev, [field.key]: { ...prev[field.key], value: e.target.value } }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
                />
              ) : (
                <input
                  type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
                  value={value}
                  onChange={e => setSettings(prev => ({ ...prev, [field.key]: { ...prev[field.key], value: e.target.value } }))}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
