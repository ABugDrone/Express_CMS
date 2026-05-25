import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const clickTracker = new Map<string, { count: number; resetAt: number }>();

function getClickKey(req: Request, adId: number): string {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
  return `${ip}:${adId}`;
}

function canTrackClick(req: Request, adId: number): boolean {
  const key = getClickKey(req, adId);
  const now = Date.now();
  const entry = clickTracker.get(key);
  if (!entry || now > entry.resetAt) {
    clickTracker.set(key, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

function serializeAd(a: any) {
  return {
    id: a.id,
    title: a.title,
    type: a.type,
    placement: a.placement,
    image_url: a.imageUrl || '',
    banner_url: a.bannerUrl || '',
    video_url: a.videoUrl || '',
    video_file: a.videoFile || '',
    redirect_url: a.redirectUrl || '',
    adsense_code: a.adsenseCode || '',
    is_paid: a.isPaid ? 1 : 0,
    is_active: a.isActive ? 1 : 0,
    start_date: a.startDate || '',
    end_date: a.endDate || '',
    impressions: a.impressions,
    clicks: a.clicks,
    created_at: a.createdAt.toISOString(),
  };
}

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

router.get('/ads', async (req: Request, res: Response) => {
  try {
    const { placement } = req.query as { placement?: string };

    const where: any = { isActive: true };
    if (placement) where.placement = placement;

    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(ads.map(serializeAd));
  } catch (err) {
    console.error('Ads list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/ads', async (req: Request, res: Response) => {
  try {
    const { action } = req.query as { action?: string };

    if (action === 'click') {
      const adId = safeParseInt(req.query.id as string);
      if (!adId) {
        res.status(400).json({ error: 'Valid ad ID is required' });
        return;
      }

      if (!canTrackClick(req, adId)) {
        res.status(429).json({ error: 'Click limit exceeded' });
        return;
      }

      await prisma.advertisement.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      });
      res.json({ message: 'Click tracked' });
      return;
    }

    await authenticate(req, res, () => {});
    if (!req.user) return;

    const { title, type, placement, image_url, banner_url, video_url, video_file, redirect_url, adsense_code, is_paid, start_date, end_date } = req.body;

    const ad = await prisma.advertisement.create({
      data: {
        title: title || 'Untitled Ad',
        type: type || 'static_image',
        placement: placement || 'top',
        imageUrl: image_url || '',
        bannerUrl: banner_url || '',
        videoUrl: video_url || '',
        videoFile: video_file || '',
        redirectUrl: redirect_url || '',
        adsenseCode: adsense_code || '',
        isPaid: is_paid === true || is_paid === 1,
        startDate: start_date || null,
        endDate: end_date || null,
      },
    });

    res.status(201).json({ id: ad.id });
  } catch (err) {
    console.error('Ad error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/ads', authenticate, async (req: Request, res: Response) => {
  try {
    const adId = safeParseInt(req.query.id as string);
    if (!adId) {
      res.status(400).json({ error: 'Valid ad ID is required' });
      return;
    }

    const { title, type, placement, image_url, banner_url, video_url, video_file, redirect_url, adsense_code, is_paid, is_active, start_date, end_date } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (type !== undefined) data.type = type;
    if (placement !== undefined) data.placement = placement;
    if (image_url !== undefined) data.imageUrl = image_url;
    if (banner_url !== undefined) data.bannerUrl = banner_url;
    if (video_url !== undefined) data.videoUrl = video_url;
    if (video_file !== undefined) data.videoFile = video_file;
    if (redirect_url !== undefined) data.redirectUrl = redirect_url;
    if (adsense_code !== undefined) data.adsenseCode = adsense_code;
    if (is_paid !== undefined) data.isPaid = is_paid === 1 || is_paid === true;
    if (is_active !== undefined) data.isActive = is_active === 1 || is_active === true;
    if (start_date !== undefined) data.startDate = start_date;
    if (end_date !== undefined) data.endDate = end_date;

    const ad = await prisma.advertisement.update({
      where: { id: adId },
      data,
    });

    res.json(serializeAd(ad));
  } catch (err) {
    console.error('Ad update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/ads', authenticate, async (req: Request, res: Response) => {
  try {
    const adId = safeParseInt(req.query.id as string);
    if (!adId) {
      res.status(400).json({ error: 'Valid ad ID is required' });
      return;
    }

    await prisma.advertisement.delete({ where: { id: adId } });
    res.json({ message: 'Ad deleted' });
  } catch (err) {
    console.error('Ad delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
