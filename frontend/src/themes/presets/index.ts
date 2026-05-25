/**
 * JM News - Premium Theme Presets
 * 
 * 6 Distinctive, Production-Grade Themes
 * Each with unique aesthetic direction and bold design choices
 */

export { classicNewsTheme } from './classicNews';
export { minimalBlogTheme } from './minimalBlog';
export { editorialMagazineTheme } from './editorialMagazine';
export { boldDarkTheme } from './boldDark';
export { luxuryEditorialTheme } from './luxuryEditorial';
export { modernMagazineTheme } from './modernMagazine';

import { classicNewsTheme } from './classicNews';
import { minimalBlogTheme } from './minimalBlog';
import { editorialMagazineTheme } from './editorialMagazine';
import { boldDarkTheme } from './boldDark';
import { luxuryEditorialTheme } from './luxuryEditorial';
import { modernMagazineTheme } from './modernMagazine';
import { ThemePreset } from '../themeTypes';

/**
 * All available theme presets
 * Admin can select from these or import custom themes
 */
export const themePresets: ThemePreset[] = [
  classicNewsTheme,
  minimalBlogTheme,
  editorialMagazineTheme,
  boldDarkTheme,
  luxuryEditorialTheme,
  modernMagazineTheme,
];

/**
 * Get theme preset by ID
 */
export function getThemePreset(id: string): ThemePreset | undefined {
  return themePresets.find(theme => theme.id === id);
}

/**
 * Get theme preset by slug
 */
export function getThemePresetBySlug(slug: string): ThemePreset | undefined {
  return themePresets.find(theme => theme.config.slug === slug);
}

/**
 * Get default theme (Classic News)
 */
export function getDefaultTheme(): ThemePreset {
  return classicNewsTheme;
}
