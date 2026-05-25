import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

router.get('/banned', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const banned = await prisma.bannedUser.findMany({
      orderBy: { bannedAt: 'desc' },
    });
    res.json(banned);
  } catch (err) {
    console.error('Banned list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/banned', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { user_id, reason } = req.body;
    if (!user_id || typeof user_id !== 'string' || user_id.length > 255) {
      res.status(400).json({ error: 'Valid user_id is required' });
      return;
    }

    const banned = await prisma.bannedUser.upsert({
      where: { userId: user_id },
      update: { reason: reason || '' },
      create: { userId: user_id, reason: reason || '' },
    });

    res.status(201).json(banned);
  } catch (err) {
    console.error('Ban user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/banned', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query as { user_id: string };
    if (!user_id) {
      res.status(400).json({ error: 'user_id is required' });
      return;
    }

    await prisma.bannedUser.delete({ where: { userId: user_id } });
    res.json({ message: 'User unbanned' });
  } catch (err) {
    console.error('Unban user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
