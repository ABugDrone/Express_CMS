import { ThemePreset } from '../themeTypes';

export const classicNewsTheme: ThemePreset = {
  id: 'classic-news',
  name: 'Classic News',
  description: 'Traditional newspaper layout with serif fonts and professional design',
  thumbnail: '/themes/previews/classic-news.jpg',
  
  config: {
    name: 'Classic News',
    slug: 'classic-news',
    description: 'Traditional newspaper layout with serif fonts and professional design',
    version: '1.0.0',
    author: 'JM News',
    previewUrl: '/themes/previews/classic-news.jpg',
    isActive: true,
    isPremium: false,
    
    colors: {
      primary: '#d97706',
      primaryHover: '#b45309',
      primaryLight: '#fbbf24',
      primaryDark: '#92400e',
      
      secondary: '#1f2937',
      secondaryHover: '#111827',
      secondaryLight: '#374151',
      secondaryDark: '#0f172a',
      
      accent: '#3b82f6',
      accentHover: '#2563eb',
      
      background: '#ffffff',
      backgroundAlt: '#f9fafb',
      backgroundDark: '#111827',
      
      text: '#111827',
      textMuted: '#6b7280',
      textLight: '#9ca3af',
      textInverse: '#ffffff',
      
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      borderDark: '#d1d5db',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    typography: {
      fontHeading: "'Playfair Display', serif",
      fontBody: "'Inter', sans-serif",
      fontMono: "'Fira Code', monospace",
      
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
      },
      
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
        loose: 2,
      },
      
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
      },
    },
    
    layout: {
      containerWidth: '1280px',
      containerWidthNarrow: '768px',
      containerWidthWide: '1536px',
      
      sidebarWidth: '320px',
      sidebarPosition: 'right',
      
      gridColumns: 3,
      gridGap: '1.5rem',
      
      spacing: 8,
      
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        base: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      
      shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
    
    components: {
      header: {
        style: 'classic',
        logoPosition: 'center',
        logoSize: 'lg',
        navigationStyle: 'horizontal',
        navigationPosition: 'bottom',
        showSearch: true,
        showSocial: true,
        showDarkModeToggle: true,
        sticky: true,
        transparent: false,
      },
      
      articleCard: {
        style: 'grid',
        showExcerpt: true,
        showAuthor: true,
        showDate: true,
        showCategory: true,
        showReadTime: true,
        showTags: false,
        imageAspectRatio: '16/9',
        imagePosition: 'top',
        hoverEffect: 'lift',
      },
      
      footer: {
        style: 'multi-column',
        showNewsletter: true,
        showSocial: true,
        showQuickLinks: true,
        showLegal: true,
        showCopyright: true,
        columns: 4,
      },
      
      sidebar: {
        position: 'right',
        width: '320px',
        sticky: true,
        showSearch: true,
        showCategories: true,
        showTrending: true,
        showTags: true,
        showAds: true,
        showNewsletter: true,
      },
      
      articlePage: {
        layout: 'narrow',
        readingWidth: '768px',
        fontSize: '1.125rem',
        lineHeight: 1.75,
        showTableOfContents: true,
        showShareButtons: true,
        showAuthorBio: true,
        showRelatedArticles: true,
        showComments: true,
      },
      
      comments: {
        style: 'threaded',
        maxDepth: 3,
        showVoting: true,
        showAvatars: true,
        allowAnonymous: false,
        requireModeration: true,
      },
    },
    
    animations: {
      enabled: true,
      duration: '200ms',
      easing: 'ease-in-out',
      pageTransition: true,
      hoverEffects: true,
      scrollAnimations: false,
    },
    
    accessibility: {
      highContrast: false,
      focusVisible: true,
      reducedMotion: false,
      fontSize: 'normal',
    },
    
    cssContent: `
/* Classic News Theme - Custom Styles */

.article-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid var(--color-border);
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.article-title {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.25;
}

.article-excerpt {
  font-family: var(--font-body);
  color: var(--color-text-muted);
  line-height: 1.6;
}

.category-badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-full);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.header-logo {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.navigation-link {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
  transition: color 0.2s ease-in-out;
}

.navigation-link:hover {
  color: var(--color-primary);
}

.footer-section-title {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 1rem;
}
    `,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
