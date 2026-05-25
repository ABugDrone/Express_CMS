import { SitemapStream, streamToPromise } from 'sitemap';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { Readable } from 'stream';

const SITEMAP_LIMIT = 5000;

export async function generateSitemapXml(): Promise<string> {
  const baseUrl = env.APP_URL;

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: SITEMAP_LIMIT,
    }),
    prisma.category.findMany({
      select: { slug: true },
    }),
  ]);

  const staticPages = [
    { url: '/', changefreq: 'hourly' as const, priority: 1.0 },
    { url: '/about', changefreq: 'monthly' as const, priority: 0.5 },
    { url: '/team', changefreq: 'weekly' as const, priority: 0.6 },
    { url: '/advertise', changefreq: 'monthly' as const, priority: 0.4 },
    { url: '/privacy', changefreq: 'yearly' as const, priority: 0.3 },
    { url: '/tos', changefreq: 'yearly' as const, priority: 0.3 },
  ];

  const links = [
    ...staticPages,
    ...articles.map((a) => ({
      url: `/article/${a.slug}`,
      changefreq: 'daily' as const,
      priority: 0.9,
      lastmod: a.updatedAt.toISOString(),
    })),
    ...categories.map((c) => ({
      url: `/category/${c.slug}`,
      changefreq: 'daily' as const,
      priority: 0.7,
    })),
  ];

  const stream = new SitemapStream({ hostname: baseUrl });
  const promise = streamToPromise(Readable.from(links).pipe(stream));
  return (await promise).toString();
}

export function generateOgTags(params: {
  title: string;
  description?: string;
  imageUrl?: string;
  url: string;
  type?: string;
}): Record<string, string> {
  return {
    'og:title': params.title,
    'og:description': params.description || params.title,
    'og:image': params.imageUrl || `${env.APP_URL}/favicon.svg`,
    'og:url': `${env.APP_URL}${params.url}`,
    'og:type': params.type || 'article',
    'twitter:card': 'summary_large_image',
    'twitter:title': params.title,
    'twitter:description': params.description || params.title,
    'twitter:image': params.imageUrl || `${env.APP_URL}/favicon.svg`,
  };
}
