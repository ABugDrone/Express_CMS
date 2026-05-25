import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { uniqueSlug } from '../lib/slug.js';
import { cache, TTL, cacheKey } from '../lib/cache.js';
import { wsManager } from '../lib/websocket.js';
import { env } from '../config/env.js';

const router = Router();

function invalidateArticleCache(articleId?: number) {
  cache.del(cacheKey('articles', 'list'));
  if (articleId) {
    cache.del(cacheKey('article', String(articleId)));
  }
}

const articleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  typeId: true,
  authorName: true,
  authorId: true,
  imageUrl: true,
  videoUrl: true,
  driveUrl: true,
  tags: true,
  isFeatured: true,
  isBreaking: true,
  isPublished: true,
  views: true,
  createdAt: true,
  newsType: {
    select: {
      id: true,
      name: true,
      slug: true,
    }
  }
};

function serializeArticle(a: any) {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt || '',
    content: a.content || '',
    category: a.newsType?.name || 'News',
    category_id: a.typeId || null,
    author: a.authorName,
    image_url: a.imageUrl || '',
    video_url: a.videoUrl || '',
    drive_url: a.driveUrl || '',
    tags: a.tags ? JSON.parse(a.tags) : [],
    is_featured: a.isFeatured ? 1 : 0,
    is_breaking: a.isBreaking ? 1 : 0,
    is_published: a.isPublished ? 1 : 0,
    views: a.views,
    created_at: a.createdAt.toISOString(),
  };
}

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

router.get('/articles', async (req: Request, res: Response) => {
  try {
    const {
      id,
      page = '1',
      limit = '12',
      category,
      search,
      featured,
      breaking,
      slug,
    } = req.query as Record<string, string>;

    // Single article by ID
    if (id) {
      const cacheKey_id = cacheKey('article', id);
      const cachedArticle = cache.get<any>(cacheKey_id);
      if (cachedArticle) {
        res.json(cachedArticle);
        return;
      }
      const articleId = safeParseInt(id);
      if (!articleId) {
        res.status(400).json({ error: 'Valid article ID is required' });
        return;
      }
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: { 
          comments: { where: { isSpam: false }, orderBy: { createdAt: 'desc' }, take: 50 },
          newsType: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
      });
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      if (!article.isPublished && req.user?.role !== 'admin') {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      const response = {
        ...serializeArticle(article),
        comments: article.comments,
      };
      cache.set(cacheKey('article', id), response, TTL.ARTICLES);
      res.json(response);
      return;
    }

    if (slug) {
      const cacheKey_slug = cacheKey('article', 'slug', slug);
      const cachedSlug = cache.get<any>(cacheKey_slug);
      if (cachedSlug) {
        res.json(cachedSlug);
        return;
      }
      const article = await prisma.article.findUnique({
        where: { slug },
        include: { 
          comments: { where: { isSpam: false }, orderBy: { createdAt: 'desc' }, take: 50 },
          newsType: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
      });
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      if (!article.isPublished && req.user?.role !== 'admin') {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      const slugResponse = {
        ...serializeArticle(article),
        comments: article.comments,
      };
      cache.set(cacheKey('article', 'slug', slug), slugResponse, TTL.ARTICLES);
      res.json(slugResponse);
      return;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isPublished: true };
    if (req.user?.role === 'admin') {
      delete where.isPublished;
    }
    if (category) {
      where.newsType = { slug: category };
    }
    if (featured === '1') where.isFeatured = true;
    if (breaking === '1') where.isBreaking = true;
    if (search && search.length >= 2) {
      const searchTerm = search.slice(0, 100);
      where.OR = [
        { title: { contains: searchTerm } },
        { excerpt: { contains: searchTerm } },
      ];
    }

    // Cache list results by query params
    const listCacheKey = cacheKey('articles', 'list', JSON.stringify({ page, limit, category, featured, breaking }));
    const cachedList = cache.get<{ items: any[]; total: number; page: number; total_pages: number }>(listCacheKey);
    if (cachedList && !search) {
      res.json(cachedList);
      return;
    }

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: articleSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.article.count({ where }),
    ]);

    const listResponse = {
      items: items.map(serializeArticle),
      total,
      page: pageNum,
      total_pages: Math.ceil(total / limitNum),
    };

    if (!search) {
      cache.set(listCacheKey, listResponse, TTL.ARTICLES_LIST);
    }

    res.json(listResponse);
  } catch (err) {
    console.error('Articles list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/articles', authenticate, async (req: Request, res: Response) => {
  try {
    const authUser = req.user!;
    const { title, excerpt, content, category_id, image_url, video_url, drive_url, tags, is_featured, is_breaking } = req.body;

    if (!title || title.length < 2) {
      res.status(400).json({ error: 'Title is required (min 2 characters)' });
      return;
    }
    if (title.length > 300) {
      res.status(400).json({ error: 'Title too long (max 300 characters)' });
      return;
    }

    // Validate category_id if provided
    let typeId = null;
    if (category_id) {
      const newsType = await prisma.newsType.findUnique({ where: { id: category_id } });
      if (!newsType) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }
      typeId = category_id;
    }

    const slug = await uniqueSlug(title, 'article');

    const tagArray = Array.isArray(tags) ? tags : [];
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || '',
        content: content || '',
        typeId,
        authorName: authUser.username,
        authorId: authUser.userId,
        imageUrl: image_url || '',
        videoUrl: video_url || '',
        driveUrl: drive_url || '',
        tags: JSON.stringify(tagArray),
        isFeatured: is_featured === true || is_featured === 1,
        isBreaking: is_breaking === true || is_breaking === 1,
      },
    });

    invalidateArticleCache();

    // Push breaking news via WebSocket
    if (env.WS_ENABLED && (is_breaking === true || is_breaking === 1)) {
      wsManager.notifyBreakingNews({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
      });
    }

    res.status(201).json({ id: article.id, slug: article.slug });
  } catch (err) {
    console.error('Article create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/articles', authenticate, async (req: Request, res: Response) => {
  try {
    const articleId = safeParseInt(req.query.id as string);
    if (!articleId) {
      res.status(400).json({ error: 'Valid article ID is required' });
      return;
    }

    const existing = await prisma.article.findUnique({ 
      where: { id: articleId },
      include: {
        newsType: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    if (!existing) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    const { title, excerpt, content, category_id, image_url, video_url, drive_url, tags, is_featured, is_breaking, is_published } = req.body;

    if (title !== undefined) {
      if (title.length < 2 || title.length > 300) {
        res.status(400).json({ error: 'Title must be 2-300 characters' });
        return;
      }
    }

    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = await uniqueSlug(title, 'article', articleId);
    }

    const tagArray = tags !== undefined ? (Array.isArray(tags) ? tags : []) : (existing.tags ? JSON.parse(existing.tags) : []);

    // Handle category_id update
    let typeId = existing.typeId;
    if (category_id !== undefined) {
      if (category_id === null) {
        typeId = null;
      } else {
        const newsType = await prisma.newsType.findUnique({ where: { id: category_id } });
        if (!newsType) {
          res.status(400).json({ error: 'Invalid category ID' });
          return;
        }
        typeId = category_id;
      }
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        title: title !== undefined ? title : existing.title,
        slug,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: content !== undefined ? content : existing.content,
        typeId,
        imageUrl: image_url !== undefined ? image_url : existing.imageUrl,
        videoUrl: video_url !== undefined ? video_url : existing.videoUrl,
        driveUrl: drive_url !== undefined ? drive_url : existing.driveUrl,
        tags: JSON.stringify(tagArray),
        isFeatured: is_featured !== undefined ? (is_featured === true || is_featured === 1) : existing.isFeatured,
        isBreaking: is_breaking !== undefined ? (is_breaking === true || is_breaking === 1) : existing.isBreaking,
        isPublished: is_published !== undefined ? (is_published === true || is_published === 1) : existing.isPublished,
      },
    });

    invalidateArticleCache(articleId);
    res.json(serializeArticle({ ...article, newsType: existing.newsType }));
  } catch (err) {
    console.error('Article update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/articles', authenticate, async (req: Request, res: Response) => {
  try {
    const articleId = safeParseInt(req.query.id as string);
    if (!articleId) {
      res.status(400).json({ error: 'Valid article ID is required' });
      return;
    }

    await prisma.article.delete({ where: { id: articleId } });
    invalidateArticleCache(articleId);
    res.json({ message: 'Article deleted' });
  } catch (err) {
    console.error('Article delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;