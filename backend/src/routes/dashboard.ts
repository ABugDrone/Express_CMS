import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, async (_req: Request, res: Response) => {
  try {
    const [
      totalArticles,
      draftArticles,
      totalComments,
      spamComments,
      activeAds,
      totalAds,
      bannedUsers,
      totalViewsResult,
      totalClicksResult,
      recentArticles,
      recentComments,
      topArticles,
      newsTypes,
    ] = await Promise.all([
      prisma.article.count({ where: { isPublished: true } }),
      prisma.article.count({ where: { isPublished: false } }),
      prisma.comment.count({ where: { isSpam: false } }),
      prisma.comment.count({ where: { isSpam: true } }),
      prisma.advertisement.count({ where: { isActive: true } }),
      prisma.advertisement.count(),
      prisma.bannedUser.count(),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.advertisement.aggregate({ _sum: { clicks: true } }),
      prisma.article.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, authorName: true, views: true, createdAt: true, isFeatured: true, isBreaking: true },
      }),
      prisma.comment.findMany({
        where: { isSpam: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, authorName: true, content: true, createdAt: true },
      }),
      prisma.article.findMany({
        orderBy: { views: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, views: true, createdAt: true },
      }),
      // Get news types with article counts
      prisma.newsType.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { articles: true }
          }
        }
      }),
    ]);

    res.json({
      stats: {
        articles: totalArticles,
        drafts: draftArticles,
        comments: totalComments,
        spam_comments: spamComments,
        ads_active: activeAds,
        ads_total: totalAds,
        banned_users: bannedUsers,
        total_views: totalViewsResult._sum.views || 0,
        total_ad_clicks: totalClicksResult._sum.clicks || 0,
      },
      recent_articles: recentArticles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        author: a.authorName,
        views: a.views,
        created_at: a.createdAt.toISOString(),
        is_featured: a.isFeatured,
        is_breaking: a.isBreaking,
      })),
      recent_comments: recentComments.map((c) => ({
        id: c.id,
        author: c.authorName,
        content: c.content.slice(0, 100),
        created_at: c.createdAt.toISOString(),
      })),
      top_articles: topArticles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        views: a.views,
        created_at: a.createdAt.toISOString(),
      })),
      by_news_type: newsTypes.map((nt) => ({
        id: nt.id,
        name: nt.name,
        slug: nt.slug,
        count: nt._count.articles,
      })),
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
