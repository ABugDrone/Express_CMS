import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

function serializeElement(e: any) {
  return {
    id: e.id,
    key: e.key,
    type: e.type,
    placement: e.placement,
    content: e.content,
    sort_order: e.sortOrder,
    is_active: e.isActive ? 1 : 0,
    created_at: e.createdAt.toISOString(),
  };
}

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

router.get('/page-elements', async (_req: Request, res: Response) => {
  try {
    const { placement } = _req.query as { placement?: string };
    const where: any = { isActive: true };
    if (placement) where.placement = placement;
    const elements = await prisma.pageElement.findMany({
      where,
      orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(elements.map(serializeElement));
  } catch (err) {
    console.error('Page elements error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/page-elements/all', authenticate, async (_req: Request, res: Response) => {
  try {
    const elements = await prisma.pageElement.findMany({
      orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(elements.map(serializeElement));
  } catch (err) {
    console.error('All page elements error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/page-elements', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key, type, placement, content, sort_order, is_active } = req.body;
    if (!key || !type || !placement || !content) {
      res.status(400).json({ error: 'Key, type, placement, and content are required' });
      return;
    }
    const element = await prisma.pageElement.create({
      data: {
        key,
        type,
        placement,
        content,
        sortOrder: sort_order ?? 0,
        isActive: is_active !== undefined ? (is_active === 1 || is_active === true) : true,
      },
    });
    res.status(201).json({ id: element.id });
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Page element with this key already exists' });
      return;
    }
    console.error('Page element create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/page-elements', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const elementId = safeParseInt(req.query.id as string);
    if (!elementId) {
      res.status(400).json({ error: 'Valid page element ID is required' });
      return;
    }
    const { key, type, placement, content, sort_order, is_active } = req.body;
    const data: any = {};
    if (key !== undefined) data.key = key;
    if (type !== undefined) data.type = type;
    if (placement !== undefined) data.placement = placement;
    if (content !== undefined) data.content = content;
    if (sort_order !== undefined) data.sortOrder = sort_order;
    if (is_active !== undefined) data.isActive = is_active === 1 || is_active === true;

    const element = await prisma.pageElement.update({ where: { id: elementId }, data });
    res.json(serializeElement(element));
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Page element not found' });
      return;
    }
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Page element with this key already exists' });
      return;
    }
    console.error('Page element update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/page-elements', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const elementId = safeParseInt(req.query.id as string);
    if (!elementId) {
      res.status(400).json({ error: 'Valid page element ID is required' });
      return;
    }
    await prisma.pageElement.delete({ where: { id: elementId } });
    res.json({ message: 'Page element deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Page element not found' });
      return;
    }
    console.error('Page element delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
