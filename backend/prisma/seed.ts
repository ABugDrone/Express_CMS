import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  // ── Admin User ───────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@jmnews.com',
      password: adminPassword,
      displayName: 'Administrator',
      role: 'admin',
      isActive: true,
    },
  });
  console.log(`✓ Admin user: ${admin.username}`);

  // ── News Types (replaces hardcoded categories) ───────────────────────────
  const newsTypes = [
    { name: 'News', slug: 'news', description: 'Latest news and updates', icon: 'newspaper', sortOrder: 1 },
    { name: 'Politics', slug: 'politics', description: 'Political news and analysis', icon: 'landmark', sortOrder: 2 },
    { name: 'Opinion', slug: 'opinion', description: 'Editorial and opinion pieces', icon: 'message-square', sortOrder: 3 },
    { name: 'Business', slug: 'business', description: 'Business and economy news', icon: 'briefcase', sortOrder: 4 },
    { name: 'Health', slug: 'health', description: 'Health and wellness news', icon: 'heart', sortOrder: 5 },
    { name: 'Agri & Environ', slug: 'agri-environ', description: 'Agriculture and environment', icon: 'leaf', sortOrder: 6 },
    { name: 'Education', slug: 'education', description: 'Education news and updates', icon: 'book', sortOrder: 7 },
    { name: 'Entertainment', slug: 'entertainment', description: 'Entertainment and culture', icon: 'film', sortOrder: 8 },
    { name: 'Technology', slug: 'technology', description: 'Tech news and innovation', icon: 'cpu', sortOrder: 9 },
    { name: 'Sports', slug: 'sports', description: 'Sports news and results', icon: 'trophy', sortOrder: 10 },
    { name: 'Life', slug: 'life', description: 'Lifestyle and human interest', icon: 'smile', sortOrder: 11 },
  ];

  for (const nt of newsTypes) {
    await prisma.newsType.upsert({
      where: { slug: nt.slug },
      update: {},
      create: { ...nt, isActive: true, isStandalone: false },
    });
  }
  console.log(`✓ ${newsTypes.length} news types seeded`);

  // ── Site Settings ────────────────────────────────────────────────────────
  const siteSettings = [
    { key: 'site_name', value: 'JM News', type: 'string', description: 'Site display name' },
    { key: 'site_tagline', value: 'Factual & Timely News', type: 'string', description: 'Site tagline' },
    { key: 'site_logo_url', value: '', type: 'image', description: 'News logo image URL' },
    { key: 'site_favicon_url', value: '', type: 'image', description: 'Favicon URL' },
    { key: 'site_email', value: 'info@jmnews.com', type: 'email', description: 'Contact email' },
    { key: 'site_phone', value: '+234 XXX XXX XXXX', type: 'phone', description: 'Contact phone' },
    { key: 'site_address', value: 'Abuja, Nigeria', type: 'text', description: 'Physical address' },
    { key: 'footer_copyright', value: '© 2026 Toko Technologies. All rights reserved.', type: 'text', description: 'Footer copyright text' },
    { key: 'newsletter_title', value: 'JM Brief', type: 'string', description: 'Newsletter section title' },
    { key: 'newsletter_description', value: 'Daily news to your inbox.', type: 'string', description: 'Newsletter description' },
    { key: 'whatsapp_channel_url', value: 'https://whatsapp.com/channel/0029VbAvBF50lwgzHxehLm3l', type: 'url', description: 'WhatsApp channel link' },
    { key: 'paper_edition_url', value: 'https://www.facebook.com/profile.php?id=61554997846277', type: 'url', description: 'Paper edition download link' },
  ];

  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`✓ ${siteSettings.length} site settings seeded`);

  // ── Social Links ─────────────────────────────────────────────────────────
  const socials = [
    { platform: 'facebook', icon: 'facebook', url: '#', label: 'Facebook', sortOrder: 1 },
    { platform: 'twitter', icon: 'twitter', url: '#', label: 'Twitter', sortOrder: 2 },
    { platform: 'instagram', icon: 'instagram', url: '#', label: 'Instagram', sortOrder: 3 },
    { platform: 'youtube', icon: 'youtube', url: '#', label: 'YouTube', sortOrder: 4 },
    { platform: 'linkedin', icon: 'linkedin', url: '#', label: 'LinkedIn', sortOrder: 5 },
    { platform: 'whatsapp', icon: 'message-circle', url: '#', label: 'WhatsApp', sortOrder: 6 },
  ];

  for (const s of socials) {
    await prisma.socialLink.upsert({
      where: { platform: s.platform },
      update: {},
      create: { ...s, isActive: true },
    });
  }
  console.log(`✓ ${socials.length} social links seeded`);

  // ── Quick Links ──────────────────────────────────────────────────────────
  const quickLinks = [
    { label: 'Home', url: '/', group: 'footer', sortOrder: 1 },
    { label: 'About Us', url: '/about', group: 'footer', sortOrder: 2 },
    { label: 'Our Team', url: '/team', group: 'footer', sortOrder: 3 },
    { label: 'Advertise', url: '/advertise', group: 'footer', sortOrder: 4 },
    { label: 'Privacy Policy', url: '/privacy', group: 'legal', sortOrder: 1 },
    { label: 'Terms of Service', url: '/tos', group: 'legal', sortOrder: 2 },
    { label: 'Paper Edition', url: '#paper-edition', group: 'extra', sortOrder: 1 },
    { label: 'Subscribe', url: '#subscribe', group: 'extra', sortOrder: 2 },
  ];

  for (const l of quickLinks) {
    const existing = await prisma.quickLink.findFirst({
      where: { group: l.group, label: l.label },
    });
    if (!existing) {
      await prisma.quickLink.create({ data: { ...l, isActive: true, icon: '' } });
    }
  }
  console.log(`✓ ${quickLinks.length} quick links seeded`);

  // ── Legal Pages ──────────────────────────────────────────────────────────
  const legalPages = [
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: 'Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information when you visit our website.\n\nWe collect information you provide directly, such as when you create an account, subscribe to newsletters, or contact us. We also automatically collect certain information about your device and usage patterns.\n\nWe use your information to provide and improve our services, communicate with you, and ensure the security of our platform. We do not sell your personal information to third parties.',
      sortOrder: 1,
    },
    {
      slug: 'terms',
      title: 'Terms of Service',
      content: 'By accessing and using JM News, you agree to be bound by these Terms of Service.\n\nContent on this site is for informational purposes only. While we strive for accuracy, we make no warranties about the completeness or reliability of the information provided.\n\nUser comments and contributions must be respectful and lawful. We reserve the right to remove any content that violates these terms.',
      sortOrder: 2,
    },
  ];

  for (const p of legalPages) {
    await prisma.legalPage.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, isActive: true },
    });
  }
  console.log(`✓ ${legalPages.length} legal pages seeded`);

  // ── Contact Info ─────────────────────────────────────────────────────────
  const contacts = [
    { type: 'email', label: 'Email', value: 'info@jmnews.com', icon: 'mail', sortOrder: 1 },
    { type: 'phone', label: 'Phone', value: '+234 XXX XXX XXXX', icon: 'phone', sortOrder: 2 },
    { type: 'address', label: 'Address', value: 'Abuja, Nigeria', icon: 'map-pin', sortOrder: 3 },
  ];

  for (const c of contacts) {
    const existing = await prisma.contactInfo.findFirst({
      where: { type: c.type },
    });
    if (!existing) {
      await prisma.contactInfo.create({ data: { ...c, isActive: true } });
    }
  }
  console.log(`✓ ${contacts.length} contact info seeded`);

  // ── CTA Elements ─────────────────────────────────────────────────────────
  const ctas = [
    { label: 'WhatsApp Channel', text: 'Join our WhatsApp channel for instant updates', link: 'https://whatsapp.com/channel/0029VbAvBF50lwgzHxehLm3l', placement: 'sidebar', sortOrder: 1 },
    { label: 'Newsletter', text: 'Subscribe to our daily newsletter', link: '#subscribe', placement: 'sidebar', sortOrder: 2 },
    { label: 'Paper Edition', text: 'Download our print edition', link: 'https://www.facebook.com/profile.php?id=61554997846277', placement: 'sidebar', sortOrder: 3 },
  ];

  for (const c of ctas) {
    const existing = await prisma.cTAElement.findFirst({
      where: { label: c.label },
    });
    if (!existing) {
      await prisma.cTAElement.create({ data: { ...c, isActive: true } });
    }
  }
  console.log(`✓ ${ctas.length} CTA elements seeded`);

  // ── Theme Presets (6 themes) ──────────────────────────────────────────────

  interface ThemeSeed {
    name: string; slug: string; description: string; author: string;
    version: string; isPremium: boolean; isActive: boolean;
    config: Record<string, unknown>;
  }

  const themePresets: ThemeSeed[] = [
    {
      name: 'Default Light', slug: 'default-light',
      description: 'Clean, modern light theme with amber accents',
      author: 'JM News', version: '1.0.0', isPremium: false, isActive: true,
      config: {
        colors: { primary: '#d97706', primaryHover: '#b45309', primaryLight: '#fbbf24', primaryDark: '#92400e', secondary: '#1f2937', secondaryHover: '#111827', secondaryLight: '#374151', secondaryDark: '#0f172a', accent: '#3b82f6', accentHover: '#2563eb', background: '#ffffff', backgroundAlt: '#f9fafb', backgroundDark: '#111827', text: '#111827', textMuted: '#6b7280', textLight: '#9ca3af', textInverse: '#ffffff', border: '#e5e7eb', borderLight: '#f3f4f6', borderDark: '#d1d5db', success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' },
        typography: { fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif", fontMono: "'Fira Code', monospace", fontSize: { xs: '1.125rem', sm: '1.3125rem', base: '1.5rem', lg: '1.6875rem', xl: '1.875rem', '2xl': '2.25rem', '3xl': '2.8125rem', '4xl': '3.375rem', '5xl': '4.5rem', '6xl': '5.625rem' }, fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 }, lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75, loose: 2 }, letterSpacing: { tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em' } },
        layout: { containerWidth: '1280px', containerWidthNarrow: '768px', containerWidthWide: '1536px', sidebarWidth: '320px', sidebarPosition: 'right', gridColumns: 3, gridGap: '1.5rem', spacing: 8, borderRadius: { none: '0', sm: '0.25rem', base: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px' }, shadow: { sm: '0 1px 2px 0 rgba(0,0,0,0.05)', base: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)', lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' } },
        components: { header: { style: 'classic', logoPosition: 'center', logoSize: 'lg', navigationStyle: 'horizontal', navigationPosition: 'bottom', showSearch: true, showSocial: true, showDarkModeToggle: true, sticky: true, transparent: false }, articleCard: { style: 'grid', showExcerpt: true, showAuthor: true, showDate: true, showCategory: true, showReadTime: true, showTags: false, imageAspectRatio: '16/9', imagePosition: 'top', hoverEffect: 'lift' }, footer: { style: 'multi-column', showNewsletter: true, showSocial: true, showQuickLinks: true, showLegal: true, showCopyright: true, columns: 4 }, sidebar: { position: 'right', width: '320px', sticky: true, showSearch: true, showCategories: true, showTrending: true, showTags: true, showAds: true, showNewsletter: true }, articlePage: { layout: 'narrow', readingWidth: '768px', fontSize: '1.125rem', lineHeight: 1.75, showTableOfContents: true, showShareButtons: true, showAuthorBio: true, showRelatedArticles: true, showComments: true }, comments: { style: 'threaded', maxDepth: 3, showVoting: true, showAvatars: true, allowAnonymous: false, requireModeration: true } },
        animations: { enabled: true, duration: '200ms', easing: 'ease-in-out', pageTransition: true, hoverEffects: true, scrollAnimations: false },
        accessibility: { highContrast: false, focusVisible: true, reducedMotion: false, fontSize: 'normal' },
        cssContent: '',
      },
    },
    {
      name: 'Minimal Blog', slug: 'minimal-blog',
      description: 'Clean, minimalist design with lots of whitespace and center-aligned content',
      author: 'JM News', version: '1.0.0', isPremium: false, isActive: false,
      config: {
        colors: { primary: '#000000', primaryHover: '#1f2937', primaryLight: '#374151', primaryDark: '#000000', secondary: '#6b7280', secondaryHover: '#4b5563', secondaryLight: '#9ca3af', secondaryDark: '#374151', accent: '#3b82f6', accentHover: '#2563eb', background: '#ffffff', backgroundAlt: '#fafafa', backgroundDark: '#0a0a0a', text: '#1f2937', textMuted: '#6b7280', textLight: '#9ca3af', textInverse: '#ffffff', border: '#f3f4f6', borderLight: '#f9fafb', borderDark: '#e5e7eb', success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' },
        typography: { fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif", fontMono: "'JetBrains Mono', monospace", fontSize: { xs: '1.21875rem', sm: '1.40625rem', base: '1.59375rem', lg: '1.78125rem', xl: '2.0625rem', '2xl': '2.625rem', '3xl': '3.375rem', '4xl': '4.5rem', '5xl': '6rem', '6xl': '7.5rem' }, fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 }, lineHeight: { tight: 1.3, normal: 1.6, relaxed: 1.8, loose: 2.2 }, letterSpacing: { tight: '-0.02em', normal: '0', wide: '0.02em', wider: '0.04em' } },
        layout: { containerWidth: '720px', containerWidthNarrow: '640px', containerWidthWide: '960px', sidebarWidth: '0px', sidebarPosition: 'none', gridColumns: 1, gridGap: '3rem', spacing: 12, borderRadius: { none: '0', sm: '0', base: '0', lg: '0', xl: '0', full: '9999px' }, shadow: { sm: 'none', base: 'none', lg: 'none', xl: 'none' } },
        components: { header: { style: 'minimal', logoPosition: 'center', logoSize: 'md', navigationStyle: 'horizontal', navigationPosition: 'bottom', showSearch: false, showSocial: true, showDarkModeToggle: true, sticky: false, transparent: true }, articleCard: { style: 'list', showExcerpt: true, showAuthor: true, showDate: true, showCategory: false, showReadTime: true, showTags: false, imageAspectRatio: '21/9', imagePosition: 'top', hoverEffect: 'none' }, footer: { style: 'centered', showNewsletter: false, showSocial: true, showQuickLinks: false, showLegal: true, showCopyright: true, columns: 1 }, sidebar: { position: 'none', width: '0px', sticky: false, showSearch: false, showCategories: false, showTrending: false, showTags: false, showAds: false, showNewsletter: false }, articlePage: { layout: 'narrow', readingWidth: '640px', fontSize: '1.1875rem', lineHeight: 1.8, showTableOfContents: false, showShareButtons: true, showAuthorBio: true, showRelatedArticles: true, showComments: true }, comments: { style: 'flat', maxDepth: 1, showVoting: false, showAvatars: true, allowAnonymous: false, requireModeration: true } },
        animations: { enabled: true, duration: '300ms', easing: 'ease-out', pageTransition: true, hoverEffects: false, scrollAnimations: true },
        accessibility: { highContrast: false, focusVisible: true, reducedMotion: false, fontSize: 'large' },
        cssContent: '',
      },
    },
    {
      name: 'Editorial Magazine', slug: 'editorial-magazine',
      description: 'Bold magazine-style layout with large imagery, red accents, and dark header',
      author: 'JM News', version: '1.0.0', isPremium: false, isActive: false,
      config: {
        colors: { primary: '#dc2626', primaryHover: '#b91c1c', primaryLight: '#ef4444', primaryDark: '#991b1b', secondary: '#0f172a', secondaryHover: '#020617', secondaryLight: '#1e293b', secondaryDark: '#000000', accent: '#f59e0b', accentHover: '#d97706', background: '#ffffff', backgroundAlt: '#f8fafc', backgroundDark: '#0f172a', text: '#0f172a', textMuted: '#64748b', textLight: '#94a3b8', textInverse: '#ffffff', border: '#e2e8f0', borderLight: '#f1f5f9', borderDark: '#cbd5e1', success: '#10b981', warning: '#f59e0b', error: '#dc2626', info: '#3b82f6' },
        typography: { fontHeading: "'Bebas Neue', 'Arial Black', sans-serif", fontBody: "'Source Sans Pro', sans-serif", fontMono: "'Courier New', monospace", fontSize: { xs: '1.125rem', sm: '1.3125rem', base: '1.5rem', lg: '1.6875rem', xl: '2.0625rem', '2xl': '2.625rem', '3xl': '3.75rem', '4xl': '5.25rem', '5xl': '6.75rem', '6xl': '9rem' }, fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 900 }, lineHeight: { tight: 1.1, normal: 1.4, relaxed: 1.6, loose: 1.8 }, letterSpacing: { tight: '-0.03em', normal: '0', wide: '0.03em', wider: '0.08em' } },
        layout: { containerWidth: '1440px', containerWidthNarrow: '960px', containerWidthWide: '1920px', sidebarWidth: '360px', sidebarPosition: 'right', gridColumns: 4, gridGap: '2rem', spacing: 10, borderRadius: { none: '0', sm: '0', base: '0', lg: '0', xl: '0', full: '9999px' }, shadow: { sm: '0 2px 4px rgba(0,0,0,0.1)', base: '0 4px 8px rgba(0,0,0,0.12)', lg: '0 8px 16px rgba(0,0,0,0.15)', xl: '0 16px 32px rgba(0,0,0,0.18)' } },
        components: { header: { style: 'modern', logoPosition: 'left', logoSize: 'lg', navigationStyle: 'mega', navigationPosition: 'top', showSearch: true, showSocial: true, showDarkModeToggle: true, sticky: true, transparent: false }, articleCard: { style: 'featured', showExcerpt: true, showAuthor: true, showDate: true, showCategory: true, showReadTime: false, showTags: true, imageAspectRatio: '4/3', imagePosition: 'background', hoverEffect: 'zoom' }, footer: { style: 'multi-column', showNewsletter: true, showSocial: true, showQuickLinks: true, showLegal: true, showCopyright: true, columns: 5 }, sidebar: { position: 'right', width: '360px', sticky: true, showSearch: false, showCategories: true, showTrending: true, showTags: true, showAds: true, showNewsletter: true }, articlePage: { layout: 'wide', readingWidth: '960px', fontSize: '1.125rem', lineHeight: 1.7, showTableOfContents: true, showShareButtons: true, showAuthorBio: true, showRelatedArticles: true, showComments: true }, comments: { style: 'threaded', maxDepth: 2, showVoting: true, showAvatars: true, allowAnonymous: false, requireModeration: true } },
        animations: { enabled: true, duration: '250ms', easing: 'cubic-bezier(0.4,0,0.2,1)', pageTransition: true, hoverEffects: true, scrollAnimations: true },
        accessibility: { highContrast: false, focusVisible: true, reducedMotion: false, fontSize: 'normal' },
        cssContent: '',
      },
    },
    {
      name: 'Bold Dark', slug: 'bold-dark',
      description: 'Cyberpunk editorial with neon green accents, glassmorphism, and dramatic dark contrast',
      author: 'JM News', version: '1.0.0', isPremium: true, isActive: false,
      config: {
        colors: { primary: '#00ff9f', primaryHover: '#00e68a', primaryLight: '#66ffbf', primaryDark: '#00cc7f', secondary: '#8b5cf6', secondaryHover: '#7c3aed', secondaryLight: '#a78bfa', secondaryDark: '#6d28d9', accent: '#06b6d4', accentHover: '#0891b2', background: '#0a0a0f', backgroundAlt: '#13131a', backgroundDark: '#000000', text: '#f8fafc', textMuted: '#94a3b8', textLight: '#cbd5e1', textInverse: '#0a0a0f', border: '#1e293b', borderLight: '#334155', borderDark: '#0f172a', success: '#00ff9f', warning: '#fbbf24', error: '#ff0055', info: '#06b6d4' },
        typography: { fontHeading: "'Orbitron', 'Rajdhani', sans-serif", fontBody: "'DM Sans', 'Outfit', sans-serif", fontMono: "'JetBrains Mono', 'Fira Code', monospace", fontSize: { xs: '1.03125rem', sm: '1.21875rem', base: '1.40625rem', lg: '1.59375rem', xl: '1.875rem', '2xl': '2.4375rem', '3xl': '3.375rem', '4xl': '4.875rem', '5xl': '6.75rem', '6xl': '9rem' }, fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 900 }, lineHeight: { tight: 1.15, normal: 1.5, relaxed: 1.7, loose: 2 }, letterSpacing: { tight: '-0.04em', normal: '0', wide: '0.04em', wider: '0.12em' } },
        layout: { containerWidth: '1400px', containerWidthNarrow: '900px', containerWidthWide: '1800px', sidebarWidth: '380px', sidebarPosition: 'right', gridColumns: 3, gridGap: '2rem', spacing: 10, borderRadius: { none: '0', sm: '0.375rem', base: '0.75rem', lg: '1.25rem', xl: '2rem', full: '9999px' }, shadow: { sm: '0 0 10px rgba(0,255,159,0.1)', base: '0 0 20px rgba(0,255,159,0.15), 0 4px 12px rgba(0,0,0,0.5)', lg: '0 0 40px rgba(0,255,159,0.2), 0 8px 24px rgba(0,0,0,0.6)', xl: '0 0 60px rgba(0,255,159,0.25), 0 16px 48px rgba(0,0,0,0.7)' } },
        components: { header: { style: 'modern', logoPosition: 'left', logoSize: 'lg', navigationStyle: 'horizontal', navigationPosition: 'top', showSearch: true, showSocial: true, showDarkModeToggle: false, sticky: true, transparent: true }, articleCard: { style: 'featured', showExcerpt: true, showAuthor: true, showDate: true, showCategory: true, showReadTime: true, showTags: true, imageAspectRatio: '16/9', imagePosition: 'background', hoverEffect: 'lift' }, footer: { style: 'multi-column', showNewsletter: true, showSocial: true, showQuickLinks: true, showLegal: true, showCopyright: true, columns: 4 }, sidebar: { position: 'right', width: '380px', sticky: true, showSearch: true, showCategories: true, showTrending: true, showTags: true, showAds: true, showNewsletter: true }, articlePage: { layout: 'narrow', readingWidth: '800px', fontSize: '1.0625rem', lineHeight: 1.7, showTableOfContents: true, showShareButtons: true, showAuthorBio: true, showRelatedArticles: true, showComments: true }, comments: { style: 'threaded', maxDepth: 3, showVoting: true, showAvatars: true, allowAnonymous: false, requireModeration: true } },
        animations: { enabled: true, duration: '400ms', easing: 'cubic-bezier(0.34,1.56,0.64,1)', pageTransition: true, hoverEffects: true, scrollAnimations: true },
        accessibility: { highContrast: true, focusVisible: true, reducedMotion: false, fontSize: 'normal' },
        cssContent: '',
      },
    },
    {
      name: 'Luxury Editorial', slug: 'luxury-editorial',
      description: 'High-fashion magazine aesthetic with gold accents, serif typography, and cream backgrounds',
      author: 'JM News', version: '1.0.0', isPremium: true, isActive: false,
      config: {
        colors: { primary: '#c9a961', primaryHover: '#b8964d', primaryLight: '#d4b876', primaryDark: '#a88a45', secondary: '#2d2d2d', secondaryHover: '#1a1a1a', secondaryLight: '#4a4a4a', secondaryDark: '#0d0d0d', accent: '#cd7f32', accentHover: '#b56f28', background: '#fdfbf7', backgroundAlt: '#f8f6f1', backgroundDark: '#1a1a1a', text: '#2d2d2d', textMuted: '#6b6b6b', textLight: '#9a9a9a', textInverse: '#fdfbf7', border: '#e8e4dc', borderLight: '#f0ede6', borderDark: '#d4cfc3', success: '#5a7d5a', warning: '#c9a961', error: '#8b4545', info: '#5a6d7d' },
        typography: { fontHeading: "'Cormorant Garamond', 'Playfair Display', serif", fontBody: "'Crimson Pro', 'Source Serif Pro', serif", fontMono: "'IBM Plex Mono', monospace", fontSize: { xs: '1.21875rem', sm: '1.40625rem', base: '1.59375rem', lg: '1.78125rem', xl: '2.0625rem', '2xl': '2.625rem', '3xl': '3.75rem', '4xl': '5.25rem', '5xl': '7.5rem', '6xl': '10.5rem' }, fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 }, lineHeight: { tight: 1.2, normal: 1.6, relaxed: 1.8, loose: 2.2 }, letterSpacing: { tight: '-0.03em', normal: '0', wide: '0.03em', wider: '0.1em' } },
        layout: { containerWidth: '1200px', containerWidthNarrow: '800px', containerWidthWide: '1600px', sidebarWidth: '340px', sidebarPosition: 'right', gridColumns: 3, gridGap: '3rem', spacing: 12, borderRadius: { none: '0', sm: '0', base: '0', lg: '0', xl: '0', full: '9999px' }, shadow: { sm: '0 1px 3px rgba(45,45,45,0.08)', base: '0 2px 8px rgba(45,45,45,0.1)', lg: '0 8px 24px rgba(45,45,45,0.12)', xl: '0 16px 48px rgba(45,45,45,0.15)' } },
        components: { header: { style: 'centered', logoPosition: 'center', logoSize: 'lg', navigationStyle: 'horizontal', navigationPosition: 'bottom', showSearch: true, showSocial: false, showDarkModeToggle: true, sticky: true, transparent: false }, articleCard: { style: 'featured', showExcerpt: true, showAuthor: true, showDate: true, showCategory: false, showReadTime: true, showTags: false, imageAspectRatio: '4/3', imagePosition: 'top', hoverEffect: 'fade' }, footer: { style: 'simple', showNewsletter: true, showSocial: true, showQuickLinks: true, showLegal: true, showCopyright: true, columns: 3 }, sidebar: { position: 'right', width: '340px', sticky: true, showSearch: false, showCategories: true, showTrending: true, showTags: false, showAds: false, showNewsletter: true }, articlePage: { layout: 'narrow', readingWidth: '720px', fontSize: '1.1875rem', lineHeight: 1.8, showTableOfContents: false, showShareButtons: true, showAuthorBio: true, showRelatedArticles: true, showComments: true }, comments: { style: 'flat', maxDepth: 2, showVoting: false, showAvatars: true, allowAnonymous: false, requireModeration: true } },
        animations: { enabled: true, duration: '600ms', easing: 'cubic-bezier(0.25,0.46,0.45,0.94)', pageTransition: true, hoverEffects: true, scrollAnimations: true },
        accessibility: { highContrast: false, focusVisible: true, reducedMotion: false, fontSize: 'large' },
        cssContent: '',
      },
    },
    {
      name: 'Modern Magazine', slug: 'modern-magazine',
      description: 'Bold, colorful design with pink/purple accents and masonry layout',
      author: 'JM News', version: '1.0.0', isPremium: false, isActive: false,
      config: {
        colors: { primary: '#ec4899', primaryHover: '#db2777', primaryLight: '#f9a8d4', primaryDark: '#9f1239', secondary: '#8b5cf6', secondaryHover: '#7c3aed', secondaryLight: '#c4b5fd', secondaryDark: '#6d28d9', accent: '#f59e0b', accentHover: '#d97706', background: '#ffffff', backgroundAlt: '#faf5ff', backgroundDark: '#1e1b4b', text: '#1e1b4b', textMuted: '#64748b', textLight: '#94a3b8', textInverse: '#ffffff', border: '#e2e8f0', borderLight: '#f1f5f9', borderDark: '#cbd5e1', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#06b6d4' },
        typography: { fontHeading: "'Montserrat', sans-serif", fontBody: "'Open Sans', sans-serif", fontMono: "'JetBrains Mono', monospace", fontSize: { xs: '1.125rem', sm: '1.3125rem', base: '1.5rem', lg: '1.6875rem', xl: '1.875rem', '2xl': '2.25rem', '3xl': '3rem', '4xl': '3.75rem', '5xl': '5.25rem', '6xl': '6.75rem' }, fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 }, lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.75, loose: 2 }, letterSpacing: { tight: '-0.05em', normal: '0', wide: '0.025em', wider: '0.1em' } },
        layout: { containerWidth: '1400px', containerWidthNarrow: '800px', containerWidthWide: '1600px', sidebarWidth: '360px', sidebarPosition: 'right', gridColumns: 4, gridGap: '2rem', spacing: 8, borderRadius: { none: '0', sm: '0.5rem', base: '1rem', lg: '1.5rem', xl: '2rem', full: '9999px' }, shadow: { sm: '0 2px 4px 0 rgba(0,0,0,0.05)', base: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', lg: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', xl: '0 25px 50px -12px rgba(0,0,0,0.25)' } },
        components: { header: { style: 'modern', logoPosition: 'left', logoSize: 'md', navigationStyle: 'horizontal', navigationPosition: 'top', showSearch: true, showSocial: true, showDarkModeToggle: true, sticky: true, transparent: false }, articleCard: { style: 'masonry', showExcerpt: true, showAuthor: true, showDate: true, showCategory: true, showReadTime: true, showTags: true, imageAspectRatio: '4/3', imagePosition: 'top', hoverEffect: 'zoom' }, footer: { style: 'multi-column', showNewsletter: true, showSocial: true, showQuickLinks: true, showLegal: true, showCopyright: true, columns: 3 }, sidebar: { position: 'right', width: '360px', sticky: true, showSearch: false, showCategories: true, showTrending: true, showTags: true, showAds: true, showNewsletter: true }, articlePage: { layout: 'wide', readingWidth: '800px', fontSize: '1.125rem', lineHeight: 1.8, showTableOfContents: false, showShareButtons: true, showAuthorBio: true, showRelatedArticles: true, showComments: true }, comments: { style: 'nested', maxDepth: 5, showVoting: true, showAvatars: true, allowAnonymous: false, requireModeration: false } },
        animations: { enabled: true, duration: '300ms', easing: 'cubic-bezier(0.4,0,0.2,1)', pageTransition: true, hoverEffects: true, scrollAnimations: true },
        accessibility: { highContrast: false, focusVisible: true, reducedMotion: false, fontSize: 'normal' },
        cssContent: '',
      },
    },
  ];

  await prisma.theme.deleteMany({});
  for (const preset of themePresets) {
    const theme = await prisma.theme.create({
      data: {
        name: preset.name,
        slug: preset.slug,
        description: preset.description,
        cssContent: JSON.stringify(preset.config),
        isActive: preset.isActive,
        isPremium: preset.isPremium,
        author: preset.author,
        version: preset.version,
      },
    });
    console.log(`  ✓ ${theme.name}${preset.isActive ? ' (active)' : ''}`);
  }

  console.log('\n✓ All CMS data seeded successfully');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
