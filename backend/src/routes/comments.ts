import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const commentPostLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many comments from this IP, please slow down.',
});

const router = Router();

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

function isValidEmail(email: string): boolean {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.get('/comments', async (req: Request, res: Response) => {
  try {
    const articleId = safeParseInt(req.query.article_id as string);
    if (!articleId) {
      res.status(400).json({ error: 'Valid article_id is required' });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string || '20', 10)));
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { articleId, isSpam: false },
        include: { replies: { where: { isSpam: false } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { articleId, isSpam: false } }),
    ]);

    res.json({ items: comments, total, page, total_pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Comments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/comments', commentPostLimiter, async (req: Request, res: Response) => {
  try {
    const { action } = req.query as { action?: string };

    if (action === 'vote') {
      const commentId = safeParseInt(req.query.id as string);
      if (!commentId) {
        res.status(400).json({ error: 'Valid comment ID is required' });
        return;
      }

      const { direction } = req.body as { direction?: string };
      if (direction !== 'up' && direction !== 'down') {
        res.status(400).json({ error: 'Direction must be "up" or "down"' });
        return;
      }

      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { votes: { increment: direction === 'up' ? 1 : -1 } },
      });
      res.json(comment);
      return;
    }

    const { article_id, author_name, author_email, author_avatar, author_id, is_anonymous, content, parent_id } = req.body;

    if (!article_id || !content) {
      res.status(400).json({ error: 'article_id and content are required' });
      return;
    }

    if (content.length > 2000) {
      res.status(400).json({ error: 'Comment too long (max 2000 characters)' });
      return;
    }

    if (author_email && !isValidEmail(author_email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const parentId = parent_id ? safeParseInt(String(parent_id)) : null;
    if (parent_id && !parentId) {
      res.status(400).json({ error: 'Invalid parent_id' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        articleId: article_id,
        authorName: author_name || 'Anonymous',
        authorEmail: author_email || '',
        authorAvatar: author_avatar || '',
        authorId: author_id || null,
        isAnonymous: is_anonymous || false,
        content,
        parentId,
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/comments', authenticate, async (req: Request, res: Response) => {
  try {
    const commentId = safeParseInt(req.query.id as string);
    if (!commentId) {
      res.status(400).json({ error: 'Valid comment ID is required' });
      return;
    }

    const { is_spam, is_featured } = req.body;
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        isSpam: is_spam !== undefined ? (is_spam === 1 || is_spam === true) : undefined,
        isFeatured: is_featured !== undefined ? (is_featured === 1 || is_featured === true) : undefined,
      },
    });

    res.json(comment);
  } catch (err) {
    console.error('Comment update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/comments', authenticate, async (req: Request, res: Response) => {
  try {
    const commentId = safeParseInt(req.query.id as string);
    if (!commentId) {
      res.status(400).json({ error: 'Valid comment ID is required' });
      return;
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Comment delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
