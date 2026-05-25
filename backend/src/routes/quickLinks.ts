import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

function serializeLink(l: any) {
  return {
    id: l.id,
    label: l.label,
    url: l.url,
    group: l.group,
    icon: l.icon || '',
    sort_order: l.sortOrder,
    is_active: l.isActive ? 1 : 0,
    created_at: l.createdAt.toISOString(),
  };
}

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

router.get('/quick-links', async (_req: Request, res: Response) => {
  try {
    const { group } = _req.query as { group?: string };
    const where: any = { isActive: true };
    if (group) where.group = group;
    const links = await prisma.quickLink.findMany({
      where,
      orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(links.map(serializeLink));
  } catch (err) {
    console.error('Quick links error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/quick-links/all', authenticate, async (_req: Request, res: Response) => {
  try {
    const links = await prisma.quickLink.findMany({
      orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(links.map(serializeLink));
  } catch (err) {
    console.error('All quick links error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/quick-links', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { label, url, group, icon, sort_order, is_active } = req.body;
    if (!label || !url) {
      res.status(400).json({ error: 'Label and URL are required' });
      return;
    }
    const link = await prisma.quickLink.create({
      data: {
        label,
        url,
        group: group || 'footer',
        icon: icon || '',
        sortOrder: sort_order ?? 0,
        isActive: is_active !== undefined ? (is_active === 1 || is_active === true) : true,
      },
    });
    res.status(201).json({ id: link.id });
  } catch (err) {
    console.error('Quick link create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/quick-links', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const linkId = safeParseInt(req.query.id as string);
    if (!linkId) {
      res.status(400).json({ error: 'Valid quick link ID is required' });
      return;
    }
    const { label, url, group, icon, sort_order, is_active } = req.body;
    const data: any = {};
    if (label !== undefined) data.label = label;
    if (url !== undefined) data.url = url;
    if (group !== undefined) data.group = group;
    if (icon !== undefined) data.icon = icon;
    if (sort_order !== undefined) data.sortOrder = sort_order;
    if (is_active !== undefined) data.isActive = is_active === 1 || is_active === true;

    const link = await prisma.quickLink.update({ where: { id: linkId }, data });
    res.json(serializeLink(link));
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Quick link not found' });
      return;
    }
    console.error('Quick link update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/quick-links', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const linkId = safeParseInt(req.query.id as string);
    if (!linkId) {
      res.status(400).json({ error: 'Valid quick link ID is required' });
      return;
    }
    await prisma.quickLink.delete({ where: { id: linkId } });
    res.json({ message: 'Quick link deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Quick link not found' });
      return;
    }
    console.error('Quick link delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
