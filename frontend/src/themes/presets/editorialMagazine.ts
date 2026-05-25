import { ThemePreset } from '../themeTypes';

export const editorialMagazineTheme: ThemePreset = {
  id: 'editorial-magazine',
  name: 'Editorial Magazine',
  description: 'Bold magazine-style layout with large imagery and multi-column design',
  thumbnail: '/themes/previews/editorial-magazine.jpg',
  
  config: {
    name: 'Editorial Magazine',
    slug: 'editorial-magazine',
    description: 'Bold magazine-style layout with large imagery and multi-column design',
    version: '1.0.0',
    author: 'JM News',
    previewUrl: '/themes/previews/editorial-magazine.jpg',
    isActive: false,
    isPremium: false,
    
    colors: {
      primary: '#dc2626',
      primaryHover: '#b91c1c',
      primaryLight: '#ef4444',
      primaryDark: '#991b1b',
      
      secondary: '#0f172a',
      secondaryHover: '#020617',
      secondaryLight: '#1e293b',
      secondaryDark: '#000000',
      
      accent: '#f59e0b',
      accentHover: '#d97706',
      
      background: '#ffffff',
      backgroundAlt: '#f8fafc',
      backgroundDark: '#0f172a',
      
      text: '#0f172a',
      textMuted: '#64748b',
      textLight: '#94a3b8',
      textInverse: '#ffffff',
      
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      borderDark: '#cbd5e1',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#dc2626',
      info: '#3b82f6',
    },
    
    typography: {
      fontHeading: "'Bebas Neue', 'Arial Black', sans-serif",
      fontBody: "'Source Sans Pro', sans-serif",
      fontMono: "'Courier New', monospace",
      
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.375rem',
        '2xl': '1.75rem',
        '3xl': '2.5rem',
        '4xl': '3.5rem',
        '5xl': '4.5rem',
        '6xl': '6rem',
      },
      
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 900,
      },
      
      lineHeight: {
        tight: 1.1,
        normal: 1.4,
        relaxed: 1.6,
        loose: 1.8,
      },
      
      letterSpacing: {
        tight: '-0.03em',
        normal: '0',
        wide: '0.03em',
        wider: '0.08em',
      },
    },
    
    layout: {
      containerWidth: '1440px',
      containerWidthNarrow: '960px',
      containerWidthWide: '1920px',
      
      sidebarWidth: '360px',
      sidebarPosition: 'right',
      
      gridColumns: 4,
      gridGap: '2rem',
      
      spacing: 10,
      
      borderRadius: {
        none: '0',
        sm: '0',
        base: '0',
        lg: '0',
        xl: '0',
        full: '9999px',
      },
      
      shadow: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
        base: '0 4px 8px rgba(0, 0, 0, 0.12)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.18)',
      },
    },
    
    components: {
      header: {
        style: 'modern',
        logoPosition: 'left',
        logoSize: 'lg',
        navigationStyle: 'mega',
        navigationPosition: 'top',
        showSearch: true,
        showSocial: true,
        showDarkModeToggle: true,
        sticky: true,
        transparent: false,
        backgroundColor: '#0f172a',
      },
      
      articleCard: {
        style: 'featured',
        showExcerpt: true,
        showAuthor: true,
        showDate: true,
        showCategory: true,
        showReadTime: false,
        showTags: true,
        imageAspectRatio: '4/3',
        imagePosition: 'background',
        hoverEffect: 'zoom',
      },
      
      footer: {
        style: 'multi-column',
        showNewsletter: true,
        showSocial: true,
        showQuickLinks: true,
        showLegal: true,
        showCopyright: true,
        backgroundColor: '#0f172a',
        columns: 5,
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
        readingWidth: '960px',
        fontSize: '1.125rem',
        lineHeight: 1.7,
        showTableOfContents: true,
        showShareButtons: true,
        showAuthorBio: true,
        showRelatedArticles: true,
        showComments: true,
      },
      
      comments: {
        style: 'threaded',
        maxDepth: 2,
        showVoting: true,
        showAvatars: true,
        allowAnonymous: false,
        requireModeration: true,
      },
    },
    
    animations: {
      enabled: true,
      duration: '250ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      pageTransition: true,
      hoverEffects: true,
      scrollAnimations: true,
    },
    
    accessibility: {
      highContrast: false,
      focusVisible: true,
      reducedMotion: false,
      fontSize: 'normal',
    },
    
    cssContent: `
/* Editorial Magazine Theme - Custom Styles */

.article-card {
  position: relative;
  overflow: hidden;
  background: #000;
}

.article-card-image {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-card:hover .article-card-image {
  transform: scale(1.08);
}

.article-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem;
}

.article-title {
  font-family: var(--font-heading);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: white;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.article-excerpt {
  color: rgba(255,255,255,0.9);
  line-height: 1.6;
}

.category-badge {
  font-family: var(--font-heading);
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white;
  display: inline-block;
  margin-bottom: 1rem;
}

.header {
  background-color: var(--color-secondary);
  color: white;
  border-bottom: 4px solid var(--color-primary);
}

.header-logo {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.navigation-link {
  font-family: var(--font-heading);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.navigation-link:hover {
  color: var(--color-primary);
}

.hero-section {
  position: relative;
  height: 600px;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 100%);
  display: flex;
  align-items: center;
  padding: 4rem;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 4.5rem;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: white;
  max-width: 800px;
}

.footer {
  background-color: var(--color-secondary);
  color: white;
  border-top: 4px solid var(--color-primary);
}

.footer-section-title {
  font-family: var(--font-heading);
  font-weight: 900;
  font-size: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1.5rem;
}
    `,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
