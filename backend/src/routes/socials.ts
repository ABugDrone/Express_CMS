import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

function serializeSocial(s: any) {
  return {
    id: s.id,
    platform: s.platform,
    icon: s.icon,
    url: s.url,
    label: s.label || '',
    sort_order: s.sortOrder,
    is_active: s.isActive ? 1 : 0,
    created_at: s.createdAt.toISOString(),
  };
}

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

router.get('/socials', async (_req: Request, res: Response) => {
  try {
    const socials = await prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { platform: 'asc' }],
    });
    res.json(socials.map(serializeSocial));
  } catch (err) {
    console.error('Socials list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/socials/all', authenticate, async (_req: Request, res: Response) => {
  try {
    const socials = await prisma.socialLink.findMany({
      orderBy: [{ sortOrder: 'asc' }, { platform: 'asc' }],
    });
    res.json(socials.map(serializeSocial));
  } catch (err) {
    console.error('All socials error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/socials', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { platform, icon, url, label, sort_order, is_active } = req.body;
    if (!platform || !url) {
      res.status(400).json({ error: 'Platform and URL are required' });
      return;
    }
    const social = await prisma.socialLink.create({
      data: {
        platform,
        icon: icon || '',
        url,
        label: label || '',
        sortOrder: sort_order ?? 0,
        isActive: is_active !== undefined ? (is_active === 1 || is_active === true) : true,
      },
    });
    res.status(201).json({ id: social.id });
  } catch (err) {
    console.error('Social create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/socials', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const socialId = safeParseInt(req.query.id as string);
    if (!socialId) {
      res.status(400).json({ error: 'Valid social link ID is required' });
      return;
    }
    const { platform, icon, url, label, sort_order, is_active } = req.body;
    const data: any = {};
    if (platform !== undefined) data.platform = platform;
    if (icon !== undefined) data.icon = icon;
    if (url !== undefined) data.url = url;
    if (label !== undefined) data.label = label;
    if (sort_order !== undefined) data.sortOrder = sort_order;
    if (is_active !== undefined) data.isActive = is_active === 1 || is_active === true;

    const social = await prisma.socialLink.update({
      where: { id: socialId },
      data,
    });
    res.json(serializeSocial(social));
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Social link not found' });
      return;
    }
    console.error('Social update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/socials', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const socialId = safeParseInt(req.query.id as string);
    if (!socialId) {
      res.status(400).json({ error: 'Valid social link ID is required' });
      return;
    }
    await prisma.socialLink.delete({ where: { id: socialId } });
    res.json({ message: 'Social link deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Social link not found' });
      return;
    }
    console.error('Social delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
