import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

function serializeCTA(c: any) {
  return {
    id: c.id,
    label: c.label,
    text: c.text || '',
    link: c.link || '',
    placement: c.placement,
    sort_order: c.sortOrder,
    is_active: c.isActive ? 1 : 0,
    created_at: c.createdAt.toISOString(),
  };
}

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

router.get('/cta-elements', async (_req: Request, res: Response) => {
  try {
    const { placement } = _req.query as { placement?: string };
    const where: any = { isActive: true };
    if (placement) where.placement = placement;
    const ctas = await prisma.cTAElement.findMany({
      where,
      orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(ctas.map(serializeCTA));
  } catch (err) {
    console.error('CTA elements error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/cta-elements/all', authenticate, async (_req: Request, res: Response) => {
  try {
    const ctas = await prisma.cTAElement.findMany({
      orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(ctas.map(serializeCTA));
  } catch (err) {
    console.error('All CTA elements error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/cta-elements', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { label, text, link, placement, sort_order, is_active } = req.body;
    if (!label) {
      res.status(400).json({ error: 'Label is required' });
      return;
    }
    const cta = await prisma.cTAElement.create({
      data: {
        label,
        text: text || '',
        link: link || '',
        placement: placement || 'footer',
        sortOrder: sort_order ?? 0,
        isActive: is_active !== undefined ? (is_active === 1 || is_active === true) : true,
      },
    });
    res.status(201).json({ id: cta.id });
  } catch (err) {
    console.error('CTA create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/cta-elements', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const ctaId = safeParseInt(req.query.id as string);
    if (!ctaId) {
      res.status(400).json({ error: 'Valid CTA element ID is required' });
      return;
    }
    const { label, text, link, placement, sort_order, is_active } = req.body;
    const data: any = {};
    if (label !== undefined) data.label = label;
    if (text !== undefined) data.text = text;
    if (link !== undefined) data.link = link;
    if (placement !== undefined) data.placement = placement;
    if (sort_order !== undefined) data.sortOrder = sort_order;
    if (is_active !== undefined) data.isActive = is_active === 1 || is_active === true;

    const cta = await prisma.cTAElement.update({ where: { id: ctaId }, data });
    res.json(serializeCTA(cta));
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'CTA element not found' });
      return;
    }
    console.error('CTA update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/cta-elements', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const ctaId = safeParseInt(req.query.id as string);
    if (!ctaId) {
      res.status(400).json({ error: 'Valid CTA element ID is required' });
      return;
    }
    await prisma.cTAElement.delete({ where: { id: ctaId } });
    res.json({ message: 'CTA element deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'CTA element not found' });
      return;
    }
    console.error('CTA delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
