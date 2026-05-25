import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { cache, TTL, cacheKey } from '../lib/cache.js';

const router = Router();

router.get('/config', async (_req: Request, res: Response) => {
  const cached = cache.get('config');
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const [activeTheme, settings, socials, newsTypes] = await Promise.all([
      prisma.theme.findFirst({ where: { isActive: true } }),
      prisma.siteSetting.findMany({ orderBy: { key: 'asc' } }),
      prisma.socialLink.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.newsType.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    let themeConfig = null;
    if (activeTheme) {
      try {
        themeConfig = {
          id: activeTheme.id,
          name: activeTheme.name,
          slug: activeTheme.slug,
          config: typeof activeTheme.cssContent === 'string'
            ? JSON.parse(activeTheme.cssContent)
            : activeTheme.cssContent,
        };
      } catch {
        themeConfig = { id: activeTheme.id, name: activeTheme.name, slug: activeTheme.slug, config: null };
      }
    }

    const response = {
      site_name: settingsMap.site_name || 'JM News',
      site_description: settingsMap.site_description || '',
      logo_url: settingsMap.logo_url || '',
      favicon_url: settingsMap.favicon_url || '',
      footer_copyright: settingsMap.footer_copyright || '',
      active_ui_key: activeTheme?.slug || 'classic-news',
      theme: themeConfig,
      socials: socials.map(s => ({ platform: s.platform, url: s.url, icon: s.icon })),
      categories: newsTypes.map(n => ({ id: n.id, name: n.name, slug: n.slug })),
    };

    cache.set('config', response, TTL.CONFIG);
    res.json(response);
  } catch (err) {
    console.error('Config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
