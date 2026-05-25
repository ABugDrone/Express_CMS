/**
 * Theme System Types
 * Comprehensive type definitions for the JM News theme system
 */

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Accent colors
  accent: string;
  accentHover: string;
  
  // Background colors
  background: string;
  backgroundAlt: string;
  backgroundDark: string;
  
  // Text colors
  text: string;
  textMuted: string;
  textLight: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeTypography {
  // Font families
  fontHeading: string;
  fontBody: string;
  fontMono: string;
  
  // Font sizes
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  
  // Font weights
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  
  // Line heights
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  
  // Letter spacing
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
}

export interface ThemeLayout {
  // Container widths
  containerWidth: string;
  containerWidthNarrow: string;
  containerWidthWide: string;
  
  // Sidebar
  sidebarWidth: string;
  sidebarPosition: 'left' | 'right' | 'none';
  
  // Grid
  gridColumns: number;
  gridGap: string;
  
  // Spacing scale
  spacing: number; // Base unit in pixels
  
  // Border radius
  borderRadius: {
    none: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    full: string;
  };
  
  // Shadows
  shadow: {
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
}

export interface HeaderConfig {
  style: 'classic' | 'modern' | 'minimal' | 'centered' | 'split';
  logoPosition: 'left' | 'center' | 'right';
  logoSize: 'sm' | 'md' | 'lg';
  navigationStyle: 'horizontal' | 'vertical' | 'mega' | 'dropdown';
  navigationPosition: 'top' | 'bottom' | 'side';
  showSearch: boolean;
  showSocial: boolean;
  showDarkModeToggle: boolean;
  sticky: boolean;
  transparent: boolean;
  backgroundColor?: string;
}

export interface ArticleCardConfig {
  style: 'grid' | 'list' | 'masonry' | 'featured' | 'compact';
  showExcerpt: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showCategory: boolean;
  showReadTime: boolean;
  showTags: boolean;
  imageAspectRatio: '16/9' | '4/3' | '1/1' | '21/9';
  imagePosition: 'top' | 'left' | 'right' | 'background';
  hoverEffect: 'lift' | 'zoom' | 'fade' | 'none';
}

export interface FooterConfig {
  style: 'simple' | 'multi-column' | 'centered' | 'minimal';
  showNewsletter: boolean;
  showSocial: boolean;
  showQuickLinks: boolean;
  showLegal: boolean;
  showCopyright: boolean;
  backgroundColor?: string;
  columns: number;
}

export interface SidebarConfig {
  position: 'left' | 'right' | 'none';
  width: string;
  sticky: boolean;
  showSearch: boolean;
  showCategories: boolean;
  showTrending: boolean;
  showTags: boolean;
  showAds: boolean;
  showNewsletter: boolean;
}

export interface ArticlePageConfig {
  layout: 'wide' | 'narrow' | 'full-width';
  readingWidth: string;
  fontSize: string;
  lineHeight: number;
  showTableOfContents: boolean;
  showShareButtons: boolean;
  showAuthorBio: boolean;
  showRelatedArticles: boolean;
  showComments: boolean;
}

export interface CommentConfig {
  style: 'threaded' | 'flat' | 'nested';
  maxDepth: number;
  showVoting: boolean;
  showAvatars: boolean;
  allowAnonymous: boolean;
  requireModeration: boolean;
}

export interface ThemeComponents {
  header: HeaderConfig;
  articleCard: ArticleCardConfig;
  footer: FooterConfig;
  sidebar: SidebarConfig;
  articlePage: ArticlePageConfig;
  comments: CommentConfig;
}

export interface ThemeAnimations {
  enabled: boolean;
  duration: string;
  easing: string;
  pageTransition: boolean;
  hoverEffects: boolean;
  scrollAnimations: boolean;
}

export interface ThemeAccessibility {
  highContrast: boolean;
  focusVisible: boolean;
  reducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'x-large';
}

export interface Theme {
  // Metadata
  id: number;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  previewUrl?: string;
  isActive: boolean;
  isPremium: boolean;
  
  // Visual configuration
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  components: ThemeComponents;
  animations?: ThemeAnimations;
  accessibility?: ThemeAccessibility;
  
  // Custom CSS
  cssContent: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ThemeContextValue {
  theme: Theme | null;
  loading: boolean;
  error: string | null;
  setTheme: (theme: Theme) => void;
  updateTheme: (updates: Partial<Theme>) => Promise<void>;
  resetTheme: () => Promise<void>;
  applyTheme: (themeId: number) => Promise<void>;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  config: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>;
}

// API Response types
export interface ThemeResponse {
  theme: Theme;
}

export interface ThemesResponse {
  themes: Theme[];
  total: number;
}

export interface ThemeUpdateRequest {
  name?: string;
  description?: string;
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  layout?: Partial<ThemeLayout>;
  components?: Partial<ThemeComponents>;
  cssContent?: string;
}

export interface ThemeCreateRequest {
  name: string;
  slug: string;
  description: string;
  version?: string;
  author?: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  components: ThemeComponents;
  cssContent?: string;
}
