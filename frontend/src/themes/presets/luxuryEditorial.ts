import { ThemePreset } from '../themeTypes';

/**
 * LUXURY EDITORIAL THEME
 * 
 * Aesthetic Direction: High-Fashion Magazine meets Art Gallery
 * - Refined, sophisticated, timeless
 * - Generous whitespace and breathing room
 * - Elegant serif typography with modern sans-serif accents
 * - Subtle animations and transitions
 * - Gold accents on cream/ivory backgrounds
 * - Editorial photography focus
 * 
 * Inspiration: Vogue + MoMA + Financial Times Weekend
 */

export const luxuryEditorialTheme: ThemePreset = {
  id: 'luxury-editorial',
  name: 'Luxury Editorial',
  description: 'High-fashion magazine aesthetic with refined typography, gold accents, and generous whitespace',
  thumbnail: '/themes/previews/luxury-editorial.jpg',
  
  config: {
    name: 'Luxury Editorial',
    slug: 'luxury-editorial',
    description: 'High-fashion magazine aesthetic with refined typography, gold accents, and generous whitespace',
    version: '1.0.0',
    author: 'JM News',
    previewUrl: '/themes/previews/luxury-editorial.jpg',
    isActive: false,
    isPremium: true,
    
    colors: {
      // Sophisticated gold
      primary: '#c9a961',
      primaryHover: '#b8964d',
      primaryLight: '#d4b876',
      primaryDark: '#a88a45',
      
      // Deep charcoal
      secondary: '#2d2d2d',
      secondaryHover: '#1a1a1a',
      secondaryLight: '#4a4a4a',
      secondaryDark: '#0d0d0d',
      
      // Warm bronze accent
      accent: '#cd7f32',
      accentHover: '#b56f28',
      
      // Ivory and cream backgrounds
      background: '#fdfbf7',
      backgroundAlt: '#f8f6f1',
      backgroundDark: '#1a1a1a',
      
      // Rich text colors
      text: '#2d2d2d',
      textMuted: '#6b6b6b',
      textLight: '#9a9a9a',
      textInverse: '#fdfbf7',
      
      // Subtle borders
      border: '#e8e4dc',
      borderLight: '#f0ede6',
      borderDark: '#d4cfc3',
      
      // Refined status colors
      success: '#5a7d5a',
      warning: '#c9a961',
      error: '#8b4545',
      info: '#5a6d7d',
    },
    
    typography: {
      // Display: Elegant, refined serif
      fontHeading: "'Cormorant Garamond', 'Playfair Display', serif",
      // Body: Clean, readable sans-serif
      fontBody: "'Crimson Pro', 'Source Serif Pro', serif",
      // Mono: Refined monospace
      fontMono: "'IBM Plex Mono', monospace",
      
      fontSize: {
        xs: '1.21875rem',
        sm: '1.40625rem',
        base: '1.59375rem',
        lg: '1.78125rem',
        xl: '2.0625rem',
        '2xl': '2.625rem',
        '3xl': '3.75rem',
        '4xl': '5.25rem',
        '5xl': '7.5rem',
        '6xl': '10.5rem',
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
        normal: 1.6,
        relaxed: 1.8,
        loose: 2.2,
      },
      
      letterSpacing: {
        tight: '-0.03em',
        normal: '0',
        wide: '0.03em',
        wider: '0.1em',
      },
    },
    
    layout: {
      containerWidth: '1200px',
      containerWidthNarrow: '800px',
      containerWidthWide: '1600px',
      
      sidebarWidth: '340px',
      sidebarPosition: 'right',
      
      gridColumns: 3,
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
        sm: '0 1px 3px rgba(45, 45, 45, 0.08)',
        base: '0 2px 8px rgba(45, 45, 45, 0.1)',
        lg: '0 8px 24px rgba(45, 45, 45, 0.12)',
        xl: '0 16px 48px rgba(45, 45, 45, 0.15)',
      },
    },
    
    components: {
      header: {
        style: 'centered',
        logoPosition: 'center',
        logoSize: 'lg',
        navigationStyle: 'horizontal',
        navigationPosition: 'bottom',
        showSearch: true,
        showSocial: false,
        showDarkModeToggle: true,
        sticky: true,
        transparent: false,
        backgroundColor: '#fdfbf7',
      },
      
      articleCard: {
        style: 'featured',
        showExcerpt: true,
        showAuthor: true,
        showDate: true,
        showCategory: false,
        showReadTime: true,
        showTags: false,
        imageAspectRatio: '4/3',
        imagePosition: 'top',
        hoverEffect: 'fade',
      },
      
      footer: {
        style: 'simple',
        showNewsletter: true,
        showSocial: true,
        showQuickLinks: true,
        showLegal: true,
        showCopyright: true,
        backgroundColor: '#2d2d2d',
        columns: 3,
      },
      
      sidebar: {
        position: 'right',
        width: '340px',
        sticky: true,
        showSearch: false,
        showCategories: true,
        showTrending: true,
        showTags: false,
        showAds: false,
        showNewsletter: true,
      },
      
      articlePage: {
        layout: 'narrow',
        readingWidth: '720px',
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
        maxDepth: 2,
        showVoting: false,
        showAvatars: true,
        allowAnonymous: false,
        requireModeration: true,
      },
    },
    
    animations: {
      enabled: true,
      duration: '600ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      pageTransition: true,
      hoverEffects: true,
      scrollAnimations: true,
    },
    
    accessibility: {
      highContrast: false,
      focusVisible: true,
      reducedMotion: false,
      fontSize: 'large',
    },
    
    cssContent: `
/* Luxury Editorial Theme - High Fashion Magazine */

/* ═══════════════════════════════════════════════════════════════
   TYPOGRAPHY - REFINED & ELEGANT
   ═══════════════════════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@400;600&display=swap');

body {
  background: #fdfbf7;
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Subtle texture overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}

/* ═══════════════════════════════════════════════════════════════
   ARTICLE CARDS - EDITORIAL LAYOUT
   ═══════════════════════════════════════════════════════════════ */

.article-card {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border);
  padding: 4rem 0;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.article-card:hover {
  border-bottom-color: var(--color-primary);
}

.article-card-image {
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
}

.article-card-image img {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  filter: grayscale(0.2) contrast(1.05);
}

.article-card:hover .article-card-image img {
  transform: scale(1.03);
  filter: grayscale(0) contrast(1.1);
}

/* ═══════════════════════════════════════════════════════════════
   TYPOGRAPHY - EDITORIAL HIERARCHY
   ═══════════════════════════════════════════════════════════════ */

.article-title {
  font-family: var(--font-heading);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin-bottom: 1.5rem;
  transition: color 0.4s ease;
}

.article-title:hover {
  color: var(--color-primary);
}

.article-excerpt {
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--color-text-muted);
  font-weight: 300;
  margin-bottom: 1.5rem;
}

.article-meta {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-light);
  font-weight: 400;
}

.article-author {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-style: italic;
  color: var(--color-text-muted);
  font-weight: 400;
}

/* ═══════════════════════════════════════════════════════════════
   HEADER - CENTERED EDITORIAL
   ═══════════════════════════════════════════════════════════════ */

.header {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  padding: 3rem 0 2rem;
}

.header-logo {
  font-family: var(--font-heading);
  font-size: 4rem;
  font-weight: 300;
  letter-spacing: -0.03em;
  color: var(--color-text);
  text-align: center;
  margin-bottom: 2rem;
  font-style: italic;
}

.header-tagline {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text-muted);
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 400;
}

.navigation {
  display: flex;
  justify-content: center;
  gap: 3rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--color-border);
}

.navigation-link {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-text);
  font-weight: 400;
  position: relative;
  transition: color 0.4s ease;
}

.navigation-link::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-primary);
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.navigation-link:hover {
  color: var(--color-primary);
}

.navigation-link:hover::after {
  width: 100%;
}

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION - FULL BLEED EDITORIAL
   ═══════════════════════════════════════════════════════════════ */

.hero-article {
  position: relative;
  height: 85vh;
  margin-bottom: 6rem;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
  filter: grayscale(0.3) contrast(1.1);
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4rem;
  background: linear-gradient(to top, 
    rgba(253, 251, 247, 1) 0%, 
    rgba(253, 251, 247, 0.95) 30%, 
    transparent 100%);
}

.hero-category {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-weight: 600;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 5rem;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--color-text);
  max-width: 900px;
  margin-bottom: 1.5rem;
}

.hero-excerpt {
  font-family: var(--font-body);
  font-size: 1.375rem;
  line-height: 1.6;
  color: var(--color-text-muted);
  max-width: 700px;
  font-weight: 300;
}

/* ═══════════════════════════════════════════════════════════════
   PULL QUOTES - EDITORIAL EMPHASIS
   ═══════════════════════════════════════════════════════════════ */

.pull-quote {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 300;
  line-height: 1.4;
  font-style: italic;
  color: var(--color-text);
  border-left: 3px solid var(--color-primary);
  padding-left: 3rem;
  margin: 4rem 0;
  max-width: 800px;
}

.pull-quote-author {
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-text-muted);
  margin-top: 1.5rem;
  font-style: normal;
  font-weight: 400;
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR - REFINED WIDGETS
   ═══════════════════════════════════════════════════════════════ */

.sidebar-widget {
  background: transparent;
  border-top: 1px solid var(--color-border);
  padding: 3rem 0;
  margin-bottom: 0;
}

.sidebar-widget-title {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text);
  margin-bottom: 2rem;
  font-weight: 600;
}

.sidebar-article {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border-light);
}

.sidebar-article:last-child {
  border-bottom: none;
}

.sidebar-article-title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  transition: color 0.4s ease;
}

.sidebar-article-title:hover {
  color: var(--color-primary);
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER - SOPHISTICATED DARK
   ═══════════════════════════════════════════════════════════════ */

.footer {
  background: var(--color-secondary);
  color: var(--color-text-inverse);
  border-top: 3px solid var(--color-primary);
  padding: 4rem 0 2rem;
  margin-top: 6rem;
}

.footer-section-title {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-primary);
  margin-bottom: 2rem;
  font-weight: 600;
}

.footer-link {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: rgba(253, 251, 247, 0.7);
  transition: color 0.4s ease;
  font-weight: 300;
}

.footer-link:hover {
  color: var(--color-primary);
}

/* ═══════════════════════════════════════════════════════════════
   BUTTONS - REFINED INTERACTIONS
   ═══════════════════════════════════════════════════════════════ */

.btn-primary {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 1rem 2.5rem;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-text);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: 600;
}

.btn-primary:hover {
  background: var(--color-text);
  color: var(--color-background);
}

.btn-secondary {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 1rem 2.5rem;
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: 600;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

/* ═══════════════════════════════════════════════════════════════
   ARTICLE CONTENT - READING EXPERIENCE
   ═══════════════════════════════════════════════════════════════ */

.article-content {
  font-family: var(--font-body);
  font-size: 1.1875rem;
  line-height: 1.8;
  color: var(--color-text);
  font-weight: 300;
}

.article-content h2 {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.03em;
  margin-top: 4rem;
  margin-bottom: 1.5rem;
}

.article-content h3 {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 3rem;
  margin-bottom: 1rem;
}

.article-content p {
  margin-bottom: 1.5rem;
}

.article-content a {
  color: var(--color-text);
  border-bottom: 1px solid var(--color-primary);
  transition: all 0.4s ease;
  text-decoration: none;
}

.article-content a:hover {
  color: var(--color-primary);
  border-bottom-color: transparent;
}

.article-content img {
  width: 100%;
  height: auto;
  margin: 3rem 0;
  filter: grayscale(0.2) contrast(1.05);
}

.article-content figcaption {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  text-align: center;
  margin-top: 1rem;
  font-weight: 400;
}

/* ═══════════════════════════════════════════════════════════════
   SELECTION
   ═══════════════════════════════════════════════════════════════ */

::selection {
  background: rgba(201, 169, 97, 0.3);
  color: var(--color-text);
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOM SCROLLBAR
   ═══════════════════════════════════════════════════════════════ */

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-background-alt);
}

::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-dark);
}
    `,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
