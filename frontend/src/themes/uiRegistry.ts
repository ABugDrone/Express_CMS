import type { ThemePreset } from './themeTypes';
import type { ThemeProps } from './ThemeProps';

import { classicNewsTheme } from './presets/classicNews';
import { minimalBlogTheme } from './presets/minimalBlog';
import { editorialMagazineTheme } from './presets/editorialMagazine';
import { boldDarkTheme } from './presets/boldDark';
import { luxuryEditorialTheme } from './presets/luxuryEditorial';
import { modernMagazineTheme } from './presets/modernMagazine';

export interface RegistryEntry {
  slug: string;
  preset: ThemePreset;
  /**
   * Lazy-loaded theme layout component.
   * Null means "use the default shell" — the current fixed layout
   * with Header / Routes / Footer that reads config via useThemeComponents().
   * When implemented, each entry will point to a full React component
   * that replaces the default shell.
   */
  LayoutComponent?: React.LazyExoticComponent<React.ComponentType<ThemeProps>>;
}

const registry: RegistryEntry[] = [
  { slug: 'default-light', preset: classicNewsTheme },
  { slug: 'classic-news', preset: classicNewsTheme },
  { slug: 'minimal-blog', preset: minimalBlogTheme },
  { slug: 'editorial-magazine', preset: editorialMagazineTheme },
  { slug: 'bold-dark', preset: boldDarkTheme },
  { slug: 'luxury-editorial', preset: luxuryEditorialTheme },
  { slug: 'modern-magazine', preset: modernMagazineTheme },
];

const bySlug = new Map<string, RegistryEntry>(registry.map(e => [e.slug, e]));

export function getRegistryEntry(slug: string): RegistryEntry | undefined {
  return bySlug.get(slug);
}

export function getAllEntries(): RegistryEntry[] {
  return registry;
}

export function getDefaultEntry(): RegistryEntry {
  return registry[0];
}
