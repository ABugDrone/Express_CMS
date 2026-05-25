import { ThemePreset } from '../themeTypes';

export const modernMagazineTheme: ThemePreset = {
  id: 'modern-magazine',
  name: 'Modern Magazine',
  description: 'Bold, colorful design with large hero images and masonry layout',
  thumbnail: '/themes/previews/modern-magazine.jpg',
  
  config: {
    name: 'Modern Magazine',
    slug: 'modern-magazine',
    description: 'Bold, colorful design with large hero images and masonry layout',
    version: '1.0.0',
    author: 'JM News',
    isActive: false,
    isPremium: false,
    
    colors: {
      primary: '#ec4899',
      primaryHover: '#db2777',
      primaryLight: '#f9a8d4',
      primaryDark: '#9f1239',
      
      secondary: '#8b5cf6',
      secondaryHover: '#7c3aed',
      secondaryLight: '#c4b5fd',
      secondaryDark: '#6d28d9',
      
      accent: '#f59e0b',
      accentHover: '#d97706',
      
      background: '#ffffff',
      backgroundAlt: '#faf5ff',
      backgroundDark: '#1e1b4b',
      
      text: '#1e1b4b',
      textMuted: '#64748b',
      textLight: '#94a3b8',
      textInverse: '#ffffff',
      
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      borderDark: '#cbd5e1',
      
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
    },
    
    typography: {
      fontHeading: "'Montserrat', sans-serif",
      fontBody: "'Open Sans', sans-serif",
      fontMono: "'JetBrains Mono', monospace",
      
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.5rem',
        '6xl': '4.5rem',
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
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
        loose: 2,
      },
      
      letterSpacing: {
        tight: '-0.05em',
        normal: '0',
        wide: '0.025em',
        wider: '0.1em',
      },
    },
    
    layout: {
      containerWidth: '1400px',
      containerWidthNarrow: '800px',
      containerWidthWide: '1600px',
      
      sidebarWidth: '360px',
      sidebarPosition: 'right',
      
      gridColumns: 4,
      gridGap: '2rem',
      
      spacing: 8,
      
      borderRadius: {
        none: '0',
        sm: '0.5rem',
        base: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        full: '9999px',
      },
      
      shadow: {
        sm: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
    
    components: {
      header: {
        style: 'modern',
        logoPosition: 'left',
        logoSize: 'md',
        navigationStyle: 'horizontal',
        navigationPosition: 'top',
        showSearch: true,
        showSocial: true,
        showDarkModeToggle: true,
        sticky: true,
        transparent: false,
      },
      
      articleCard: {
        style: 'masonry',
        showExcerpt: true,
        showAuthor: true,
        showDate: true,
        showCategory: true,
        showReadTime: true,
        showTags: true,
        imageAspectRatio: '4/3',
        imagePosition: 'top',
        hoverEffect: 'zoom',
      },
      
      footer: {
        style: 'multi-column',
        showNewsletter: true,
        showSocial: true,
        showQuickLinks: true,
        showLegal: true,
        showCopyright: true,
        columns: 3,
      },
      
      sidebar: {
        position: 'right',
        width: '360px',
        sticky: true,
        showSearch: false,
        showCategories: true,
        showTrending: true,
        showTags: true,
        showAds: true,
        showNewsletter: true,
      },
      
      articlePage: {
        layout: 'wide',
        readingWidth: '800px',
        fontSize: '1.125rem',
        lineHeight: 1.8,
        showTableOfContents: false,
        showShareButtons: true,
        showAuthorBio: true,
        showRelatedArticles: true,
        showComments: true,
      },
      
      comments: {
        style: 'nested',
        maxDepth: 5,
        showVoting: true,
        showAvatars: true,
        allowAnonymous: false,
        requireModeration: false,
      },
    },
    
    cssContent: `
/* Modern Magazine Theme - Custom Styles */

.article-card {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-card:hover {
  box-shadow: var(--shadow-xl);
}

.article-card:hover .article-image {
  transform: scale(1.05);
}

.article-image {
  transition: transform 0.3s ease-out;
}

.article-title {
  font-family: var(--font-heading);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.category-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-full);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--color-text-inverse);
}

.header-logo {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
    `,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
