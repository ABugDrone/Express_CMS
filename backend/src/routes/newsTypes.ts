import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { uniqueSlug } from '../lib/slug.js';

const router = Router();

function serializeNewsType(t: any) {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description || '',
    icon: t.icon || '',
    sort_order: t.sortOrder,
    is_active: t.isActive ? 1 : 0,
    is_standalone: t.isStandalone ? 1 : 0,
    article_count: t._count?.articles || 0,
    created_at: t.createdAt.toISOString(),
  };
}

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

router.get('/news-types', async (_req: Request, res: Response) => {
  try {
    const types = await prisma.newsType.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { articles: true } } },
    });
    res.json(types.map(serializeNewsType));
  } catch (err) {
    console.error('News types list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/news-types/active', async (_req: Request, res: Response) => {
  try {
    const types = await prisma.newsType.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    res.json(types.map(serializeNewsType));
  } catch (err) {
    console.error('Active news types error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/news-types', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, icon, sort_order, is_active, is_standalone } = req.body;
    if (!name || name.length < 2) {
      res.status(400).json({ error: 'Name is required (min 2 characters)' });
      return;
    }
    const slug = await uniqueSlug(name, 'newsType');
    const type = await prisma.newsType.create({
      data: {
        name,
        slug,
        description: description || '',
        icon: icon || '',
        sortOrder: sort_order ?? 0,
        isActive: is_active !== undefined ? (is_active === 1 || is_active === true) : true,
        isStandalone: is_standalone === 1 || is_standalone === true,
      },
    });
    res.status(201).json({ id: type.id, slug: type.slug });
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'News type with this name already exists' });
      return;
    }
    console.error('News type create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/news-types', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const typeId = safeParseInt(req.query.id as string);
    if (!typeId) {
      res.status(400).json({ error: 'Valid news type ID is required' });
      return;
    }
    const { name, description, icon, sort_order, is_active, is_standalone } = req.body;
    const data: any = {};
    if (name !== undefined) {
      if (name.length < 2) {
        res.status(400).json({ error: 'Name must be at least 2 characters' });
        return;
      }
      data.name = name;
      data.slug = await uniqueSlug(name, 'newsType', typeId);
    }
    if (description !== undefined) data.description = description;
    if (icon !== undefined) data.icon = icon;
    if (sort_order !== undefined) data.sortOrder = sort_order;
    if (is_active !== undefined) data.isActive = is_active === 1 || is_active === true;
    if (is_standalone !== undefined) data.isStandalone = is_standalone === 1 || is_standalone === true;

    const type = await prisma.newsType.update({
      where: { id: typeId },
      data,
      include: { _count: { select: { articles: true } } },
    });
    res.json(serializeNewsType(type));
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'News type not found' });
      return;
    }
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'News type with this name already exists' });
      return;
    }
    console.error('News type update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/news-types', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const typeId = safeParseInt(req.query.id as string);
    if (!typeId) {
      res.status(400).json({ error: 'Valid news type ID is required' });
      return;
    }
    await prisma.newsType.delete({ where: { id: typeId } });
    res.json({ message: 'News type deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'News type not found' });
      return;
    }
    console.error('News type delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
