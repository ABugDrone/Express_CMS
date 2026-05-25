import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Theme, ThemeContextValue } from './themeTypes';
import { applyThemeVariables, loadThemeFromStorage, saveThemeToStorage } from './themeUtils';
import { getToken } from '../lib/api';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply default theme immediately (no waiting for API)
  useEffect(() => {
    if (defaultTheme) {
      setThemeState(defaultTheme);
      applyThemeVariables(defaultTheme);
    }
    setLoading(true);
    setError(null);

    // Load from localStorage cache first
    const cachedTheme = loadThemeFromStorage();

    // Fetch active theme from API in the background
    fetch('/api/themes/active')
      .then(res => {
        if (!res.ok) throw new Error('No active theme');
        return res.json();
      })
      .then(data => {
        const activeTheme = data.theme;
        setThemeState(activeTheme);
        applyThemeVariables(activeTheme);
        saveThemeToStorage(activeTheme);
      })
      .catch(err => {
        console.error('Theme fetch failed, using default/cached:', err);
        if (cachedTheme) {
          setThemeState(cachedTheme);
          applyThemeVariables(cachedTheme);
        }
        setError(err instanceof Error ? err.message : 'Failed to load active theme');
      })
      .finally(() => setLoading(false));
  }, [defaultTheme]);

  // Set theme (local state only, doesn't persist to API)
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeVariables(newTheme);
    saveThemeToStorage(newTheme);
  }, []);

  // Update theme (persists to API)
  const updateTheme = useCallback(async (updates: Partial<Theme>) => {
    if (!theme) {
      throw new Error('No active theme to update');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/themes/${theme.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update theme');
      }

      const data = await response.json();
      const activeTheme = data.theme;

      setThemeState(activeTheme);
      applyThemeVariables(activeTheme);
      saveThemeToStorage(activeTheme);

    } catch (err) {
      console.error('Failed to update theme:', err);
      // fallback to default
      if (defaultTheme) {
        setThemeState(defaultTheme);
        applyThemeVariables(defaultTheme);
      }
      setError(err instanceof Error ? err.message : 'Failed to update theme');
    } finally {
      setLoading(false);
    }
  }, [defaultTheme, theme]);

  // Apply theme by ID (activates a theme from the gallery)
  const applyTheme = useCallback(async (themeId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Activate theme via API
      const response = await fetch(`/api/themes/${themeId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to activate theme');
      }

      const data = await response.json();
      const activatedTheme = data.theme;

      setThemeState(activatedTheme);
      applyThemeVariables(activatedTheme);
      saveThemeToStorage(activatedTheme);

    } catch (err) {
      console.error('Failed to apply theme:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply theme');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset theme to default
  const resetTheme = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (defaultTheme) {
        setThemeState(defaultTheme);
        applyThemeVariables(defaultTheme);
        saveThemeToStorage(defaultTheme);
      }
    } catch (err) {
      console.error('Failed to reset theme:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset theme');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [defaultTheme]);

  const value: ThemeContextValue = {
    theme,
    loading,
    error,
    setTheme,
    updateTheme,
    resetTheme,
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
