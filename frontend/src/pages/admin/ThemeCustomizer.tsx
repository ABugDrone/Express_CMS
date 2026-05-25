import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../themes/useTheme';
import { Theme, ThemeColors } from '../../themes/themeTypes';
import { ArrowLeft, Save, RotateCcw, Eye, Palette } from 'lucide-react';

export default function ThemeCustomizer() {
  const navigate = useNavigate();
  const { theme: activeTheme, updateTheme, loading: themeLoading } = useTheme();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'components' | 'css'>('colors');
  const [localTheme, setLocalTheme] = useState<Theme | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTheme) {
      setLocalTheme(activeTheme);
    }
  }, [activeTheme]);

  if (!localTheme || !localTheme.colors || !localTheme.typography || !localTheme.layout || !localTheme.components) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading theme...</p>
        </div>
      </div>
    );
  }

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setLocalTheme(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        colors: {
          ...prev.colors,
          [key]: value,
        },
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localTheme || !hasChanges) return;

    try {
      setSaving(true);
      await updateTheme({
        colors: localTheme.colors,
        typography: localTheme.typography,
        layout: localTheme.layout,
        components: localTheme.components,
        cssContent: localTheme.cssContent,
      });
      setHasChanges(false);
      alert('Theme saved successfully!');
    } catch (err) {
      console.error('Failed to save theme:', err);
      alert('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm('Reset all changes? This cannot be undone.')) return;
    if (activeTheme) {
      setLocalTheme(activeTheme);
      setHasChanges(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/themes')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-6 h-6 text-amber-600" />
                  Customize Theme
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {localTheme.name} v{localTheme.version}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-700">
            {(['colors', 'typography', 'layout', 'components', 'css'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
            </h2>

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                {Object.entries(localTheme.colors ?? {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Heading Font</label>
                  <input type="text" value={localTheme.typography.fontHeading}
                    onChange={e => { setLocalTheme(prev => prev ? { ...prev, typography: { ...prev.typography, fontHeading: e.target.value } } : prev); setHasChanges(true); }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Body Font</label>
                  <input type="text" value={localTheme.typography.fontBody}
                    onChange={e => { setLocalTheme(prev => prev ? { ...prev, typography: { ...prev.typography, fontBody: e.target.value } } : prev); setHasChanges(true); }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Mono Font</label>
                  <input type="text" value={localTheme.typography.fontMono}
                    onChange={e => { setLocalTheme(prev => prev ? { ...prev, typography: { ...prev.typography, fontMono: e.target.value } } : prev); setHasChanges(true); }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-3">Font Sizes</p>
                  {Object.entries(localTheme.typography?.fontSize ?? {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{key}</span>
                      <input type="text" value={value}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, typography: { ...prev.typography, fontSize: { ...prev.typography.fontSize, [key]: e.target.value } } } : prev); setHasChanges(true); }}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Container Width</label>
                  <input type="text" value={localTheme.layout.containerWidth}
                    onChange={e => { setLocalTheme(prev => prev ? { ...prev, layout: { ...prev.layout, containerWidth: e.target.value } } : prev); setHasChanges(true); }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Sidebar Width</label>
                  <input type="text" value={localTheme.layout.sidebarWidth}
                    onChange={e => { setLocalTheme(prev => prev ? { ...prev, layout: { ...prev.layout, sidebarWidth: e.target.value } } : prev); setHasChanges(true); }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Sidebar Position</label>
                  <select value={localTheme.layout.sidebarPosition}
                    onChange={e => { setLocalTheme(prev => prev ? { ...prev, layout: { ...prev.layout, sidebarPosition: e.target.value as 'left' | 'right' | 'none' } } : prev); setHasChanges(true); }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Grid Columns</label>
                  <input type="number" value={localTheme.layout.gridColumns}
                    onChange={e => { setLocalTheme(prev => prev ? { ...prev, layout: { ...prev.layout, gridColumns: parseInt(e.target.value) || 3 } } : prev); setHasChanges(true); }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Grid Gap</label>
                  <input type="text" value={localTheme.layout.gridGap}
                    onChange={e => { setLocalTheme(prev => prev ? { ...prev, layout: { ...prev.layout, gridGap: e.target.value } } : prev); setHasChanges(true); }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Spacing (px)</label>
                  <input type="number" value={localTheme.layout.spacing}
                    onChange={e => { setLocalTheme(prev => prev ? { ...prev, layout: { ...prev.layout, spacing: parseInt(e.target.value) || 8 } } : prev); setHasChanges(true); }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-3">Border Radius</p>
                  {Object.entries(localTheme.layout?.borderRadius ?? {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{key}</span>
                      <input type="text" value={value}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, layout: { ...prev.layout, borderRadius: { ...prev.layout.borderRadius, [key]: e.target.value } } } : prev); setHasChanges(true); }}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Components Tab */}
            {activeTab === 'components' && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Header</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Style</span>
                      <select value={localTheme.components.header.style}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, header: { ...prev.components.header, style: e.target.value as any } } } : prev); setHasChanges(true); }}
                        className="w-36 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="classic">Classic</option>
                        <option value="modern">Modern</option>
                        <option value="minimal">Minimal</option>
                        <option value="centered">Centered</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Logo Position</span>
                      <select value={localTheme.components.header.logoPosition}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, header: { ...prev.components.header, logoPosition: e.target.value as any } } } : prev); setHasChanges(true); }}
                        className="w-36 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sticky</span>
                      <input type="checkbox" checked={localTheme.components.header.sticky}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, header: { ...prev.components.header, sticky: e.target.checked } } } : prev); setHasChanges(true); }}
                        className="rounded text-amber-600" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Article Card</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Style</span>
                      <select value={localTheme.components.articleCard.style}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, articleCard: { ...prev.components.articleCard, style: e.target.value as any } } } : prev); setHasChanges(true); }}
                        className="w-36 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="grid">Grid</option>
                        <option value="list">List</option>
                        <option value="featured">Featured</option>
                        <option value="compact">Compact</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show Excerpt</span>
                      <input type="checkbox" checked={localTheme.components.articleCard.showExcerpt}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, articleCard: { ...prev.components.articleCard, showExcerpt: e.target.checked } } } : prev); setHasChanges(true); }}
                        className="rounded text-amber-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show Author</span>
                      <input type="checkbox" checked={localTheme.components.articleCard.showAuthor}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, articleCard: { ...prev.components.articleCard, showAuthor: e.target.checked } } } : prev); setHasChanges(true); }}
                        className="rounded text-amber-600" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Footer</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Style</span>
                      <select value={localTheme.components.footer.style}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, footer: { ...prev.components.footer, style: e.target.value as any } } } : prev); setHasChanges(true); }}
                        className="w-36 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="simple">Simple</option>
                        <option value="multi-column">Multi Column</option>
                        <option value="centered">Centered</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Columns</span>
                      <input type="number" value={localTheme.components.footer.columns}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, footer: { ...prev.components.footer, columns: parseInt(e.target.value) || 4 } } } : prev); setHasChanges(true); }}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Sidebar</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sticky</span>
                      <input type="checkbox" checked={localTheme.components.sidebar.sticky}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, sidebar: { ...prev.components.sidebar, sticky: e.target.checked } } } : prev); setHasChanges(true); }}
                        className="rounded text-amber-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show Categories</span>
                      <input type="checkbox" checked={localTheme.components.sidebar.showCategories}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, sidebar: { ...prev.components.sidebar, showCategories: e.target.checked } } } : prev); setHasChanges(true); }}
                        className="rounded text-amber-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show Trending</span>
                      <input type="checkbox" checked={localTheme.components.sidebar.showTrending}
                        onChange={e => { setLocalTheme(prev => prev ? { ...prev, components: { ...prev.components, sidebar: { ...prev.components.sidebar, showTrending: e.target.checked } } } : prev); setHasChanges(true); }}
                        className="rounded text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CSS Tab */}
            {activeTab === 'css' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom CSS
                </label>
                <textarea
                  value={localTheme.cssContent}
                  onChange={(e) => {
                    setLocalTheme(prev => prev ? { ...prev, cssContent: e.target.value } : prev);
                    setHasChanges(true);
                  }}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="/* Add custom CSS here */"
                />
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </h2>
              {hasChanges && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 py-1 rounded">
                  Unsaved changes
                </span>
              )}
            </div>
            
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
              {/* Color Swatches */}
              {activeTab === 'colors' && (
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(localTheme.colors ?? {}).slice(0, 12).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-full h-16 rounded-lg border border-gray-300 dark:border-gray-600 mb-1"
                        style={{ backgroundColor: value }}
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{key}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Sample Content */}
              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: localTheme.colors.background }}>
                <h3 className="text-2xl font-bold mb-2" style={{ color: localTheme.colors.text }}>
                  Sample Heading
                </h3>
                <p className="mb-4" style={{ color: localTheme.colors.textMuted }}>
                  This is a sample paragraph to preview your theme colors and typography.
                </p>
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: localTheme.colors.primary, color: localTheme.colors.textInverse }}
                >
                  Primary Button
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
