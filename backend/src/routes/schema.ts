import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

router.get('/schema', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const tables = {
      users: await prisma.user.count(),
      articles: await prisma.article.count(),
      comments: await prisma.comment.count(),
      newsTypes: await prisma.newsType.count(),
      siteSettings: await prisma.siteSetting.count(),
      socialLinks: await prisma.socialLink.count(),
      quickLinks: await prisma.quickLink.count(),
      legalPages: await prisma.legalPage.count(),
      contactInfo: await prisma.contactInfo.count(),
      ctaElements: await prisma.cTAElement.count(),
      pageElements: await prisma.pageElement.count(),
      themes: await prisma.theme.count(),
      advertisements: await prisma.advertisement.count(),
      bannedUsers: await prisma.bannedUser.count(),
    };
    res.json({ status: 'ok', tables });
  } catch (err) {
    console.error('Schema error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
