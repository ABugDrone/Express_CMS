import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../themes/useTheme';
import { getToken } from '../../lib/api';
import { Theme } from '../../themes/themeTypes';
import { Palette, Download, Upload, Copy, Trash2, Eye, Check, ArrowLeft } from 'lucide-react';

export default function ThemeManager() {
  const navigate = useNavigate();
  const { theme: activeTheme, applyTheme, loading: themeLoading } = useTheme();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

  // Load all themes
  useEffect(() => {
    loadThemes();
  }, []);

  async function loadThemes() {
    try {
      setLoading(true);
      const response = await fetch('/api/themes');
      
      if (!response.ok) {
        throw new Error('Failed to load themes');
      }

      const data = await response.json();
      setThemes(data.themes || []);
    } catch (err) {
      console.error('Failed to load themes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load themes');
    } finally {
      setLoading(false);
    }
  }

  async function handleActivateTheme(themeId: number) {
    try {
      await applyTheme(themeId);
      await loadThemes(); // Reload to update active status
    } catch (err) {
      console.error('Failed to activate theme:', err);
      alert('Failed to activate theme');
    }
  }

  async function handleDuplicateTheme(themeId: number) {
    try {
      const token = getToken();
      const response = await fetch(`/api/themes/${themeId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate theme');
      }

      await loadThemes();
    } catch (err) {
      console.error('Failed to duplicate theme:', err);
      alert('Failed to duplicate theme');
    }
  }

  async function handleDeleteTheme(themeId: number) {
    if (!confirm('Are you sure you want to delete this theme?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/themes/${themeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete theme');
      }

      await loadThemes();
    } catch (err) {
      console.error('Failed to delete theme:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete theme');
    }
  }

  async function handleExportTheme(themeId: number, themeName: string) {
    try {
      const token = getToken();
      const response = await fetch(`/api/themes/${themeId}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export theme');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${themeName.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export theme:', err);
      alert('Failed to export theme');
    }
  }

  function handlePreviewTheme(theme: Theme) {
    setPreviewTheme(theme);
  }

  function closePreview() {
    setPreviewTheme(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading themes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadThemes}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Palette className="w-8 h-8 text-amber-600" />
                  Theme Manager
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage and customize your website themes
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/themes/import')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Theme
              </button>
              <button
                onClick={() => navigate('/admin/themes/customize')}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Customize Active Theme
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 transition-all ${
                theme.isActive
                  ? 'border-amber-600 ring-4 ring-amber-600/20'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Preview Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                {theme.previewUrl ? (
                  <img
                    src={theme.previewUrl}
                    alt={theme.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Active Badge */}
                {theme.isActive && (
                  <div className="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Active
                  </div>
                )}

                {/* Premium Badge */}
                {theme.isPremium && (
                  <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Premium
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {theme.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {theme.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>v{theme.version}</span>
                  <span>by {theme.author}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!theme.isActive && (
                    <button
                      onClick={() => handleActivateTheme(theme.id)}
                      disabled={themeLoading}
                      className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Activate
                    </button>
                  )}
                  
                  <button
                    onClick={() => handlePreviewTheme(theme)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicateTheme(theme.id)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleExportTheme(theme.id, theme.name)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Export"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {!theme.isActive && (
                    <button
                      onClick={() => handleDeleteTheme(theme.id)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {themes.length === 0 && (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No themes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Import a theme to get started
            </p>
            <button
              onClick={() => navigate('/admin/themes/import')}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Import Theme
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {previewTheme.name} Preview
              </h2>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {previewTheme.description}
              </p>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                  {JSON.stringify(previewTheme, null, 2)}
                </pre>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
              {!previewTheme.isActive && (
                <button
                  onClick={() => {
                    handleActivateTheme(previewTheme.id);
                    closePreview();
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Activate Theme
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
