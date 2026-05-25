import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { uniqueSlug } from '../lib/slug.js';

const router = Router();

function serializeLegal(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: p.content,
    sort_order: p.sortOrder,
    is_active: p.isActive ? 1 : 0,
    created_at: p.createdAt.toISOString(),
  };
}

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

router.get('/legal-pages', async (_req: Request, res: Response) => {
  try {
    const pages = await prisma.legalPage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    res.json(pages.map(serializeLegal));
  } catch (err) {
    console.error('Legal pages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/legal-pages/all', authenticate, async (_req: Request, res: Response) => {
  try {
    const pages = await prisma.legalPage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    res.json(pages.map(serializeLegal));
  } catch (err) {
    console.error('All legal pages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/legal-pages/:slug', async (req: Request, res: Response) => {
  try {
    const page = await prisma.legalPage.findUnique({
      where: { slug: req.params.slug },
    });
    if (!page) {
      res.status(404).json({ error: 'Legal page not found' });
      return;
    }
    res.json(serializeLegal(page));
  } catch (err) {
    console.error('Legal page get error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/legal-pages', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, content, sort_order, is_active } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }
    const slug = await uniqueSlug(title, 'legalPage');
    const page = await prisma.legalPage.create({
      data: {
        title,
        slug,
        content,
        sortOrder: sort_order ?? 0,
        isActive: is_active !== undefined ? (is_active === 1 || is_active === true) : true,
      },
    });
    res.status(201).json({ id: page.id, slug: page.slug });
  } catch (err) {
    console.error('Legal page create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/legal-pages', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const pageId = safeParseInt(req.query.id as string);
    if (!pageId) {
      res.status(400).json({ error: 'Valid legal page ID is required' });
      return;
    }
    const { title, content, sort_order, is_active } = req.body;
    const data: any = {};
    if (title !== undefined) {
      data.title = title;
      data.slug = await uniqueSlug(title, 'legalPage', pageId);
    }
    if (content !== undefined) data.content = content;
    if (sort_order !== undefined) data.sortOrder = sort_order;
    if (is_active !== undefined) data.isActive = is_active === 1 || is_active === true;

    const page = await prisma.legalPage.update({ where: { id: pageId }, data });
    res.json(serializeLegal(page));
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Legal page not found' });
      return;
    }
    console.error('Legal page update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/legal-pages', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const pageId = safeParseInt(req.query.id as string);
    if (!pageId) {
      res.status(400).json({ error: 'Valid legal page ID is required' });
      return;
    }
    await prisma.legalPage.delete({ where: { id: pageId } });
    res.json({ message: 'Legal page deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Legal page not found' });
      return;
    }
    console.error('Legal page delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
