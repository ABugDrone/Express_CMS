import { Theme, ThemeColors, ThemeTypography, ThemeLayout } from './themeTypes';

const THEME_STORAGE_KEY = 'jm-news-active-theme';

/**
 * Apply theme CSS variables to document root
 */
export function applyThemeVariables(theme: Theme): void {
  const root = document.documentElement;
  if (!theme || typeof theme !== 'object') return;

  if (theme.colors) applyColorVariables(root, theme.colors);
  if (theme.typography) applyTypographyVariables(root, theme.typography);
  if (theme.layout) applyLayoutVariables(root, theme.layout);
  if (theme.cssContent !== undefined) applyCustomCSS(theme.cssContent, theme.slug);

  // Add theme class to body
  if (theme.slug) {
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .concat(`theme-${theme.slug}`)
      .join(' ');
  }
}

/**
 * Apply color CSS variables
 */
function applyColorVariables(root: HTMLElement, colors: ThemeColors): void {
  if (!colors || typeof colors !== 'object') return;
  const set = (key: string, val: string | undefined) => { if (val) root.style.setProperty(key, val); };
  set('--color-primary', (colors as any).primary);
  set('--color-primary-hover', (colors as any).primaryHover);
  set('--color-primary-light', (colors as any).primaryLight);
  set('--color-primary-dark', (colors as any).primaryDark);
  set('--color-secondary', (colors as any).secondary);
  set('--color-secondary-hover', (colors as any).secondaryHover);
  set('--color-secondary-light', (colors as any).secondaryLight);
  set('--color-secondary-dark', (colors as any).secondaryDark);
  set('--color-accent', (colors as any).accent);
  set('--color-accent-hover', (colors as any).accentHover);
  set('--color-background', (colors as any).background);
  set('--color-background-alt', (colors as any).backgroundAlt);
  set('--color-background-dark', (colors as any).backgroundDark);
  set('--color-text', (colors as any).text);
  set('--color-text-muted', (colors as any).textMuted);
  set('--color-text-light', (colors as any).textLight);
  set('--color-text-inverse', (colors as any).textInverse);
  set('--color-border', (colors as any).border);
  set('--color-border-light', (colors as any).borderLight);
  set('--color-border-dark', (colors as any).borderDark);
  set('--color-success', (colors as any).success);
  set('--color-warning', (colors as any).warning);
  set('--color-error', (colors as any).error);
  set('--color-info', (colors as any).info);
}

/**
 * Apply typography CSS variables
 */
function applyTypographyVariables(root: HTMLElement, typography: ThemeTypography): void {
  if (!typography || typeof typography !== 'object') return;
  const set = (key: string, val: string | undefined) => { if (val) root.style.setProperty(key, val); };
  set('--font-heading', (typography as any).fontHeading);
  set('--font-body', (typography as any).fontBody);
  set('--font-mono', (typography as any).fontMono);
  if ((typography as any).fontSize && typeof (typography as any).fontSize === 'object')
    Object.entries((typography as any).fontSize).forEach(([k, v]) => root.style.setProperty(`--font-size-${k}`, v as string));
  if ((typography as any).fontWeight && typeof (typography as any).fontWeight === 'object')
    Object.entries((typography as any).fontWeight).forEach(([k, v]) => root.style.setProperty(`--font-weight-${k}`, String(v)));
  if ((typography as any).lineHeight && typeof (typography as any).lineHeight === 'object')
    Object.entries((typography as any).lineHeight).forEach(([k, v]) => root.style.setProperty(`--line-height-${k}`, String(v)));
  if ((typography as any).letterSpacing && typeof (typography as any).letterSpacing === 'object')
    Object.entries((typography as any).letterSpacing).forEach(([k, v]) => root.style.setProperty(`--letter-spacing-${k}`, v as string));
}

/**
 * Apply layout CSS variables
 */
function applyLayoutVariables(root: HTMLElement, layout: ThemeLayout): void {
  if (!layout || typeof layout !== 'object') return;
  const set = (key: string, val: string | undefined | number) => { if (val !== undefined && val !== null) root.style.setProperty(key, String(val)); };
  set('--container-width', (layout as any).containerWidth);
  set('--container-width-narrow', (layout as any).containerWidthNarrow);
  set('--container-width-wide', (layout as any).containerWidthWide);
  set('--sidebar-width', (layout as any).sidebarWidth);
  set('--sidebar-position', (layout as any).sidebarPosition);
  set('--grid-columns', (layout as any).gridColumns);
  set('--grid-gap', (layout as any).gridGap);
  set('--spacing-unit', (layout as any).spacing !== undefined ? `${(layout as any).spacing}px` : undefined);
  if ((layout as any).borderRadius && typeof (layout as any).borderRadius === 'object')
    Object.entries((layout as any).borderRadius).forEach(([k, v]) => root.style.setProperty(`--border-radius-${k}`, v as string));
  if ((layout as any).shadow && typeof (layout as any).shadow === 'object')
    Object.entries((layout as any).shadow).forEach(([k, v]) => root.style.setProperty(`--shadow-${k}`, v as string));
}

/**
 * Apply custom CSS to document
 */
function applyCustomCSS(cssContent: string, themeSlug: string): void {
  // Remove existing theme style tag
  const existingStyle = document.getElementById('theme-custom-css');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new style tag
  if (cssContent) {
    const style = document.createElement('style');
    style.id = 'theme-custom-css';
    style.setAttribute('data-theme', themeSlug);
    style.textContent = cssContent;
    document.head.appendChild(style);
  }
}

/**
 * Save theme to localStorage
 */
export function saveThemeToStorage(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.error('Failed to save theme to storage:', error);
  }
}

/**
 * Load theme from localStorage
 */
export function loadThemeFromStorage(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Theme;
  } catch (error) {
    console.error('Failed to load theme from storage:', error);
    return null;
  }
}

/**
 * Clear theme from localStorage
 */
export function clearThemeFromStorage(): void {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear theme from storage:', error);
  }
}

/**
 * Get CSS variable value
 */
export function getCSSVariable(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * Set CSS variable value
 */
export function setCSSVariable(variable: string, value: string): void {
  document.documentElement.style.setProperty(variable, value);
}

/**
 * Convert theme to CSS string (for export)
 */
export function themeToCSS(theme: Theme): string {
  const lines: string[] = [
    `/* ${theme.name} Theme */`,
    `/* Version: ${theme.version} */`,
    `/* Author: ${theme.author} */`,
    '',
    ':root {',
  ];

  // Colors
  lines.push('  /* Colors */');
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    lines.push(`  --color-${cssKey}: ${value};`);
  });

  lines.push('');

  // Typography
  lines.push('  /* Typography */');
  lines.push(`  --font-heading: ${theme.typography.fontHeading};`);
  lines.push(`  --font-body: ${theme.typography.fontBody};`);
  lines.push(`  --font-mono: ${theme.typography.fontMono};`);

  lines.push('');

  // Layout
  lines.push('  /* Layout */');
  lines.push(`  --container-width: ${theme.layout.containerWidth};`);
  lines.push(`  --sidebar-width: ${theme.layout.sidebarWidth};`);
  lines.push(`  --grid-columns: ${theme.layout.gridColumns};`);
  lines.push(`  --spacing-unit: ${theme.layout.spacing}px;`);

  lines.push('}');
  lines.push('');

  // Custom CSS
  if (theme.cssContent) {
    lines.push('/* Custom Styles */');
    lines.push(theme.cssContent);
  }

  return lines.join('\n');
}

/**
 * Generate theme preview URL
 */
export function generateThemePreviewURL(theme: Theme): string {
  const params = new URLSearchParams({
    theme: theme.slug,
    preview: 'true',
  });
  return `/preview?${params.toString()}`;
}

/**
 * Validate theme structure
 */
export function validateTheme(theme: any): theme is Theme {
  return (
    theme &&
    typeof theme === 'object' &&
    typeof theme.id === 'number' &&
    typeof theme.name === 'string' &&
    typeof theme.slug === 'string' &&
    theme.colors &&
    theme.typography &&
    theme.layout &&
    theme.components
  );
}

/**
 * Merge theme with updates
 */
export function mergeTheme(base: Theme, updates: Partial<Theme>): Theme {
  return {
    ...base,
    ...updates,
    colors: { ...base.colors, ...updates.colors },
    typography: { ...base.typography, ...updates.typography },
    layout: { ...base.layout, ...updates.layout },
    components: { ...base.components, ...updates.components },
  };
}

/**
 * Get theme contrast ratio (for accessibility)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Get relative luminance of a color
 */
function getLuminance(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const [rs, gs, bs] = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Check if theme meets WCAG AA contrast requirements
 */
export function checkWCAGCompliance(theme: Theme): {
  compliant: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check text on background
  const textContrast = getContrastRatio(theme.colors.text, theme.colors.background);
  if (textContrast < 4.5) {
    issues.push(`Text contrast ratio (${textContrast.toFixed(2)}) is below WCAG AA standard (4.5:1)`);
  }

  // Check primary on background
  const primaryContrast = getContrastRatio(theme.colors.primary, theme.colors.background);
  if (primaryContrast < 3) {
    issues.push(`Primary color contrast ratio (${primaryContrast.toFixed(2)}) is below WCAG AA standard for large text (3:1)`);
  }

  return {
    compliant: issues.length === 0,
    issues,
  };
}
