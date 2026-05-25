import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

function serializeSetting(s: any) {
  return {
    id: s.id,
    key: s.key,
    value: s.value,
    type: s.type,
    description: s.description || '',
    updated_at: s.updatedAt.toISOString(),
  };
}

router.get('/site-settings', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = {
        value: s.value,
        type: s.type,
        description: s.description,
      };
    }
    res.json(result);
  } catch (err) {
    console.error('Site settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/site-settings/all', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
    res.json(settings.map(serializeSetting));
  } catch (err) {
    console.error('Site settings list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/site-settings', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const entries = req.body as Record<string, { value: string; type?: string; description?: string }>;
    const results: any[] = [];

    for (const [key, entry] of Object.entries(entries)) {
      const setting = await prisma.siteSetting.upsert({
        where: { key },
        update: {
          value: entry.value ?? '',
          type: entry.type || 'string',
          description: entry.description || '',
        },
        create: {
          key,
          value: entry.value ?? '',
          type: entry.type || 'string',
          description: entry.description || '',
        },
      });
      results.push(serializeSetting(setting));
    }

    res.json({ message: 'Settings updated', settings: results });
  } catch (err) {
    console.error('Site settings update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/site-settings', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key, value, type, description } = req.body;
    if (!key) {
      res.status(400).json({ error: 'Key is required' });
      return;
    }
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: {
        value: value ?? '',
        type: type || 'string',
        description: description || '',
      },
      create: {
        key,
        value: value ?? '',
        type: type || 'string',
        description: description || '',
      },
    });
    res.status(201).json(serializeSetting(setting));
  } catch (err) {
    console.error('Site setting create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/site-settings', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const key = req.query.key as string;
    if (!key) {
      res.status(400).json({ error: 'Setting key is required' });
      return;
    }
    await prisma.siteSetting.delete({ where: { key } });
    res.json({ message: 'Setting deleted' });
  } catch (err) {
    console.error('Site setting delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
