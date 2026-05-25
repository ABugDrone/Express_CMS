import { ThemePreset } from '../themeTypes';

export const minimalBlogTheme: ThemePreset = {
  id: 'minimal-blog',
  name: 'Minimal Blog',
  description: 'Clean, minimalist design with lots of whitespace and center-aligned content',
  thumbnail: '/themes/previews/minimal-blog.jpg',
  
  config: {
    name: 'Minimal Blog',
    slug: 'minimal-blog',
    description: 'Clean, minimalist design with lots of whitespace and center-aligned content',
    version: '1.0.0',
    author: 'JM News',
    previewUrl: '/themes/previews/minimal-blog.jpg',
    isActive: false,
    isPremium: false,
    
    colors: {
      primary: '#000000',
      primaryHover: '#1f2937',
      primaryLight: '#374151',
      primaryDark: '#000000',
      
      secondary: '#6b7280',
      secondaryHover: '#4b5563',
      secondaryLight: '#9ca3af',
      secondaryDark: '#374151',
      
      accent: '#3b82f6',
      accentHover: '#2563eb',
      
      background: '#ffffff',
      backgroundAlt: '#fafafa',
      backgroundDark: '#0a0a0a',
      
      text: '#1f2937',
      textMuted: '#6b7280',
      textLight: '#9ca3af',
      textInverse: '#ffffff',
      
      border: '#f3f4f6',
      borderLight: '#f9fafb',
      borderDark: '#e5e7eb',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    typography: {
      fontHeading: "'Inter', sans-serif",
      fontBody: "'Inter', sans-serif",
      fontMono: "'JetBrains Mono', monospace",
      
      fontSize: {
        xs: '0.8125rem',
        sm: '0.9375rem',
        base: '1.0625rem',
        lg: '1.1875rem',
        xl: '1.375rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        '4xl': '3rem',
        '5xl': '4rem',
        '6xl': '5rem',
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
        tight: 1.3,
        normal: 1.6,
        relaxed: 1.8,
        loose: 2.2,
      },
      
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em',
        wider: '0.04em',
      },
    },
    
    layout: {
      containerWidth: '720px',
      containerWidthNarrow: '640px',
      containerWidthWide: '960px',
      
      sidebarWidth: '0px',
      sidebarPosition: 'none',
      
      gridColumns: 1,
      gridGap: '3rem',
      
      spacing: 12,
      
      borderRadius: {
        none: '0',
        sm: '0',
        base: '0',
        lg: '0',
        xl: '0',
        full: '9999px',
      },
      
      shadow: {
        sm: 'none',
        base: 'none',
        lg: 'none',
        xl: 'none',
      },
    },
    
    components: {
      header: {
        style: 'minimal',
        logoPosition: 'center',
        logoSize: 'md',
        navigationStyle: 'horizontal',
        navigationPosition: 'bottom',
        showSearch: false,
        showSocial: true,
        showDarkModeToggle: true,
        sticky: false,
        transparent: true,
      },
      
      articleCard: {
        style: 'list',
        showExcerpt: true,
        showAuthor: true,
        showDate: true,
        showCategory: false,
        showReadTime: true,
        showTags: false,
        imageAspectRatio: '21/9',
        imagePosition: 'top',
        hoverEffect: 'none',
      },
      
      footer: {
        style: 'centered',
        showNewsletter: false,
        showSocial: true,
        showQuickLinks: false,
        showLegal: true,
        showCopyright: true,
        columns: 1,
      },
      
      sidebar: {
        position: 'none',
        width: '0px',
        sticky: false,
        showSearch: false,
        showCategories: false,
        showTrending: false,
        showTags: false,
        showAds: false,
        showNewsletter: false,
      },
      
      articlePage: {
        layout: 'narrow',
        readingWidth: '640px',
        fontSize: '1.1875rem',
        lineHeight: 1.8,
        showTableOfContents: false,
        showShareButtons: true,
        showAuthorBio: true,
        showRelatedArticles: true,
        showComments: true,
      },
      
      comments: {
        style: 'flat',
        maxDepth: 1,
        showVoting: false,
        showAvatars: true,
        allowAnonymous: false,
        requireModeration: true,
      },
    },
    
    animations: {
      enabled: true,
      duration: '300ms',
      easing: 'ease-out',
      pageTransition: true,
      hoverEffects: false,
      scrollAnimations: true,
    },
    
    accessibility: {
      highContrast: false,
      focusVisible: true,
      reducedMotion: false,
      fontSize: 'large',
    },
    
    cssContent: `
/* Minimal Blog Theme - Custom Styles */

body {
  font-feature-settings: "kern" 1, "liga" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.article-card {
  border: none;
  border-bottom: 1px solid var(--color-border);
  padding: 3rem 0;
}

.article-card:hover {
  border-bottom-color: var(--color-text);
}

.article-title {
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}

.article-excerpt {
  color: var(--color-text-muted);
  line-height: 1.8;
  font-size: 1.0625rem;
}

.header-logo {
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.navigation-link {
  font-weight: 400;
  font-size: 0.9375rem;
  letter-spacing: 0.02em;
  transition: opacity 0.3s ease-out;
}

.navigation-link:hover {
  opacity: 0.6;
}

.article-content {
  font-size: 1.1875rem;
  line-height: 1.8;
  color: var(--color-text);
}

.article-content h2 {
  font-weight: 600;
  font-size: 1.75rem;
  margin-top: 3rem;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.article-content p {
  margin-bottom: 1.5rem;
}

.article-content a {
  color: var(--color-text);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.article-content a:hover {
  opacity: 0.6;
}

.footer {
  border-top: 1px solid var(--color-border);
  padding: 3rem 0;
  text-align: center;
}
    `,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
