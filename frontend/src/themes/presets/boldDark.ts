import { ThemePreset } from '../themeTypes';

/**
 * BOLD DARK THEME
 * 
 * Aesthetic Direction: Cyberpunk Editorial
 * - Dark, moody atmosphere with neon accents
 * - Glassmorphism and blur effects
 * - Sharp geometric shapes
 * - High contrast typography
 * - Animated gradients and glows
 * 
 * Inspiration: Blade Runner meets Vogue
 */

export const boldDarkTheme: ThemePreset = {
  id: 'bold-dark',
  name: 'Bold Dark',
  description: 'Cyberpunk editorial with neon accents, glassmorphism, and dramatic contrast',
  thumbnail: '/themes/previews/bold-dark.jpg',
  
  config: {
    name: 'Bold Dark',
    slug: 'bold-dark',
    description: 'Cyberpunk editorial with neon accents, glassmorphism, and dramatic contrast',
    version: '1.0.0',
    author: 'JM News',
    previewUrl: '/themes/previews/bold-dark.jpg',
    isActive: false,
    isPremium: true,
    
    colors: {
      // Neon primary
      primary: '#00ff9f',
      primaryHover: '#00e68a',
      primaryLight: '#66ffbf',
      primaryDark: '#00cc7f',
      
      // Deep purple secondary
      secondary: '#8b5cf6',
      secondaryHover: '#7c3aed',
      secondaryLight: '#a78bfa',
      secondaryDark: '#6d28d9',
      
      // Electric blue accent
      accent: '#06b6d4',
      accentHover: '#0891b2',
      
      // Dark backgrounds
      background: '#0a0a0f',
      backgroundAlt: '#13131a',
      backgroundDark: '#000000',
      
      // High contrast text
      text: '#f8fafc',
      textMuted: '#94a3b8',
      textLight: '#cbd5e1',
      textInverse: '#0a0a0f',
      
      // Subtle borders with glow
      border: '#1e293b',
      borderLight: '#334155',
      borderDark: '#0f172a',
      
      // Status colors with neon treatment
      success: '#00ff9f',
      warning: '#fbbf24',
      error: '#ff0055',
      info: '#06b6d4',
    },
    
    typography: {
      // Display: Sharp, geometric, futuristic
      fontHeading: "'Orbitron', 'Rajdhani', sans-serif",
      // Body: Clean, readable, modern
      fontBody: "'DM Sans', 'Outfit', sans-serif",
      // Mono: Technical, code-like
      fontMono: "'JetBrains Mono', 'Fira Code', monospace",
      
      fontSize: {
        xs: '0.6875rem',
        sm: '0.8125rem',
        base: '0.9375rem',
        lg: '1.0625rem',
        xl: '1.25rem',
        '2xl': '1.625rem',
        '3xl': '2.25rem',
        '4xl': '3.25rem',
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
        tight: 1.15,
        normal: 1.5,
        relaxed: 1.7,
        loose: 2,
      },
      
      letterSpacing: {
        tight: '-0.04em',
        normal: '0',
        wide: '0.04em',
        wider: '0.12em',
      },
    },
    
    layout: {
      containerWidth: '1400px',
      containerWidthNarrow: '900px',
      containerWidthWide: '1800px',
      
      sidebarWidth: '380px',
      sidebarPosition: 'right',
      
      gridColumns: 3,
      gridGap: '2rem',
      
      spacing: 10,
      
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        base: '0.75rem',
        lg: '1.25rem',
        xl: '2rem',
        full: '9999px',
      },
      
      shadow: {
        sm: '0 0 10px rgba(0, 255, 159, 0.1)',
        base: '0 0 20px rgba(0, 255, 159, 0.15), 0 4px 12px rgba(0, 0, 0, 0.5)',
        lg: '0 0 40px rgba(0, 255, 159, 0.2), 0 8px 24px rgba(0, 0, 0, 0.6)',
        xl: '0 0 60px rgba(0, 255, 159, 0.25), 0 16px 48px rgba(0, 0, 0, 0.7)',
      },
    },
    
    components: {
      header: {
        style: 'modern',
        logoPosition: 'left',
        logoSize: 'lg',
        navigationStyle: 'horizontal',
        navigationPosition: 'top',
        showSearch: true,
        showSocial: true,
        showDarkModeToggle: false, // Always dark
        sticky: true,
        transparent: true,
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
      },
      
      articleCard: {
        style: 'featured',
        showExcerpt: true,
        showAuthor: true,
        showDate: true,
        showCategory: true,
        showReadTime: true,
        showTags: true,
        imageAspectRatio: '16/9',
        imagePosition: 'background',
        hoverEffect: 'lift',
      },
      
      footer: {
        style: 'multi-column',
        showNewsletter: true,
        showSocial: true,
        showQuickLinks: true,
        showLegal: true,
        showCopyright: true,
        backgroundColor: 'rgba(19, 19, 26, 0.95)',
        columns: 4,
      },
      
      sidebar: {
        position: 'right',
        width: '380px',
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
        readingWidth: '800px',
        fontSize: '1.0625rem',
        lineHeight: 1.7,
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
      duration: '400ms',
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      pageTransition: true,
      hoverEffects: true,
      scrollAnimations: true,
    },
    
    accessibility: {
      highContrast: true,
      focusVisible: true,
      reducedMotion: false,
      fontSize: 'normal',
    },
    
    cssContent: `
/* Bold Dark Theme - Cyberpunk Editorial */

/* ═══════════════════════════════════════════════════════════════
   GLOBAL EFFECTS
   ═══════════════════════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');

body {
  background: #0a0a0f;
  background-image: 
    radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(0, 255, 159, 0.15) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(255, 0, 85, 0.15) 0px, transparent 50%);
  background-attachment: fixed;
  position: relative;
  overflow-x: hidden;
}

/* Animated grain overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: overlay;
  animation: grain 8s steps(10) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  20% { transform: translate(-15%, 5%); }
  30% { transform: translate(7%, -25%); }
  40% { transform: translate(-5%, 25%); }
  50% { transform: translate(-15%, 10%); }
  60% { transform: translate(15%, 0%); }
  70% { transform: translate(0%, 15%); }
  80% { transform: translate(3%, 35%); }
  90% { transform: translate(-10%, 10%); }
}

/* ═══════════════════════════════════════════════════════════════
   GLASSMORPHISM CARDS
   ═══════════════════════════════════════════════════════════════ */

.article-card {
  position: relative;
  background: rgba(19, 19, 26, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.article-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(0, 255, 159, 0.1) 0%, 
    transparent 50%, 
    rgba(139, 92, 246, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.article-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(0, 255, 159, 0.4);
  box-shadow: 
    0 0 40px rgba(0, 255, 159, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.6),
    inset 0 0 60px rgba(0, 255, 159, 0.05);
}

.article-card:hover::before {
  opacity: 1;
}

/* ═══════════════════════════════════════════════════════════════
   NEON TYPOGRAPHY
   ═══════════════════════════════════════════════════════════════ */

.article-title {
  font-family: var(--font-heading);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #ffffff 0%, #00ff9f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.article-title:hover {
  animation: neonPulse 2s ease-in-out infinite;
}

@keyframes neonPulse {
  0%, 100% {
    filter: drop-shadow(0 0 2px rgba(0, 255, 159, 0.5))
            drop-shadow(0 0 8px rgba(0, 255, 159, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(0, 255, 159, 0.8))
            drop-shadow(0 0 16px rgba(0, 255, 159, 0.5));
  }
}

.article-excerpt {
  font-family: var(--font-body);
  color: rgba(248, 250, 252, 0.7);
  line-height: 1.7;
  font-weight: 400;
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORY BADGES - NEON PILLS
   ═══════════════════════════════════════════════════════════════ */

.category-badge {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(0, 255, 159, 0.2), rgba(6, 182, 212, 0.2));
  border: 1px solid rgba(0, 255, 159, 0.4);
  color: #00ff9f;
  display: inline-block;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 20px rgba(0, 255, 159, 0.3),
    inset 0 0 20px rgba(0, 255, 159, 0.1);
}

.category-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.category-badge:hover::before {
  transform: translateX(100%);
}

/* ═══════════════════════════════════════════════════════════════
   HEADER - FLOATING GLASS
   ═══════════════════════════════════════════════════════════════ */

.header {
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(0, 255, 159, 0.2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

.header-logo {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #00ff9f 0%, #06b6d4 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 12px rgba(0, 255, 159, 0.5));
}

.navigation-link {
  font-family: var(--font-body);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8125rem;
  color: rgba(248, 250, 252, 0.8);
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 1rem;
}

.navigation-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #00ff9f, #06b6d4);
  transform: translateX(-50%);
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(0, 255, 159, 0.8);
}

.navigation-link:hover {
  color: #00ff9f;
  text-shadow: 0 0 12px rgba(0, 255, 159, 0.6);
}

.navigation-link:hover::after {
  width: 100%;
}

/* ═══════════════════════════════════════════════════════════════
   BUTTONS - NEON INTERACTIVE
   ═══════════════════════════════════════════════════════════════ */

.btn-primary {
  font-family: var(--font-body);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 1rem 2rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #00ff9f, #06b6d4);
  color: #0a0a0f;
  border: none;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 0 20px rgba(0, 255, 159, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #06b6d4, #8b5cf6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 0 40px rgba(0, 255, 159, 0.8),
    0 8px 24px rgba(0, 0, 0, 0.4);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary span {
  position: relative;
  z-index: 1;
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR - FLOATING PANELS
   ═══════════════════════════════════════════════════════════════ */

.sidebar-widget {
  background: rgba(19, 19, 26, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.sidebar-widget-title {
  font-family: var(--font-heading);
  font-weight: 900;
  font-size: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #00ff9f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER - DARK GLASS
   ═══════════════════════════════════════════════════════════════ */

.footer {
  background: rgba(19, 19, 26, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(0, 255, 159, 0.2);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
}

.footer-section-title {
  font-family: var(--font-heading);
  font-weight: 900;
  font-size: 1.125rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1.5rem;
  color: #00ff9f;
  text-shadow: 0 0 12px rgba(0, 255, 159, 0.5);
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-on-scroll {
  animation: fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOM SCROLLBAR
   ═══════════════════════════════════════════════════════════════ */

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: #0a0a0f;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00ff9f, #06b6d4);
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 255, 159, 0.5);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #06b6d4, #8b5cf6);
  box-shadow: 0 0 20px rgba(0, 255, 159, 0.8);
}

/* ═══════════════════════════════════════════════════════════════
   SELECTION
   ═══════════════════════════════════════════════════════════════ */

::selection {
  background: rgba(0, 255, 159, 0.3);
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 255, 159, 0.8);
}
    `,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
