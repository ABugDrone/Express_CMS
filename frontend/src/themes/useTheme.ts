import { useThemeContext } from './ThemeProvider';
import { Theme } from './themeTypes';

/**
 * Custom hook to access theme context
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, loading, updateTheme } = useTheme();
 *   
 *   if (loading) return <div>Loading theme...</div>;
 *   
 *   return (
 *     <div style={{ color: theme.colors.primary }}>
 *       <h1>{theme.name}</h1>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme() {
  return useThemeContext();
}

/**
 * Hook to get specific theme property
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const colors = useThemeProperty('colors');
 *   return <div style={{ color: colors.primary }}>Hello</div>;
 * }
 * ```
 */
export function useThemeProperty<K extends keyof Theme>(property: K): Theme[K] | undefined {
  const { theme } = useThemeContext();
  return theme?.[property];
}

/**
 * Hook to get theme colors
 */
export function useThemeColors() {
  const { theme } = useThemeContext();
  return theme?.colors;
}

/**
 * Hook to get theme typography
 */
export function useThemeTypography() {
  const { theme } = useThemeContext();
  return theme?.typography;
}

/**
 * Hook to get theme layout
 */
export function useThemeLayout() {
  const { theme } = useThemeContext();
  return theme?.layout;
}

/**
 * Hook to get theme components configuration
 */
export function useThemeComponents() {
  const { theme } = useThemeContext();
  return theme?.components;
}

/**
 * Hook to check if theme is loading
 */
export function useThemeLoading() {
  const { loading } = useThemeContext();
  return loading;
}

/**
 * Hook to get theme error
 */
export function useThemeError() {
  const { error } = useThemeContext();
  return error;
}

/**
 * Hook to update theme
 */
export function useThemeUpdate() {
  const { updateTheme } = useThemeContext();
  return updateTheme;
}

/**
 * Hook to apply theme by ID
 */
export function useThemeApply() {
  const { applyTheme } = useThemeContext();
  return applyTheme;
}

/**
 * Hook to reset theme to default
 */
export function useThemeReset() {
  const { resetTheme } = useThemeContext();
  return resetTheme;
}
