import { useState, useEffect } from 'react';
import { apiGetConfig, type SiteConfig } from '../lib/api';

const CONFIG_CACHE_KEY = 'jm-site-config';

function loadCached(): SiteConfig | null {
  try {
    const raw = sessionStorage.getItem(CONFIG_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveCache(cfg: SiteConfig) {
  try { sessionStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(cfg)); } catch {}
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(loadCached);
  const [loading, setLoading] = useState(!config);

  useEffect(() => {
    let cancelled = false;
    apiGetConfig()
      .then(cfg => {
        if (cancelled) return;
        setConfig(cfg);
        saveCache(cfg);
      })
      .catch(() => {
        // cached value already set from useState initializer
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { config, loading };
}
