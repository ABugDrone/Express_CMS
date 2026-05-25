import { useEffect } from 'react';
import { useTheme } from './useTheme';

const FONT_CACHE_KEY = 'jm-news-loaded-fonts';

function loadGoogleFont(fontFamily: string) {
  const cached = sessionStorage.getItem(FONT_CACHE_KEY);
  const loaded = cached ? JSON.parse(cached) : [];

  const family = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
  if (loaded.includes(family) || !family) return;

  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  loaded.push(family);
  sessionStorage.setItem(FONT_CACHE_KEY, JSON.stringify(loaded));
}

export default function ThemeLoader() {
  const { theme } = useTheme();

  useEffect(() => {
    if (!theme) return;

    const headingFont = theme.typography?.fontHeading;
    const bodyFont = theme.typography?.fontBody;
    const monoFont = theme.typography?.fontMono;

    if (headingFont) loadGoogleFont(headingFont);
    if (bodyFont) loadGoogleFont(bodyFont);
    if (monoFont) loadGoogleFont(monoFont);
  }, [theme]);

  return null;
}
