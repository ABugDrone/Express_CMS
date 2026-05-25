import { Router, Request, Response } from 'express';
import * as cheerio from 'cheerio';

const router = Router();

interface RssItem {
  title: string;
  url: string;
  excerpt: string;
  image: string;
  published: string;
  source: string;
  source_color: string;
}

const SOURCES: Record<string, { url: string; name: string; color: string }> = {
  punch: {
    url: 'https://punchng.com/feed',
    name: 'Punch',
    color: '#ed1c24',
  },
  dailytrust: {
    url: 'https://dailytrust.com/feed',
    name: 'Daily Trust',
    color: '#008751',
  },
};

async function fetchRss(feedUrl: string): Promise<RssItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'JM-News/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    const items: RssItem[] = [];

    $('item').each((_, el) => {
      const title = $(el).find('title').text().trim();
      const link = $(el).find('link').text().trim();
      const desc = $(el).find('description').text().trim();
      const pubDate = $(el).find('pubDate').text().trim();

      let image = '';
      const content = $(el).find('content\\:encoded').text() || $(el).find('media\\:content').attr('url') || '';
      const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
      if (imgMatch) image = imgMatch[1];

      if (title && link) {
        items.push({
          title,
          url: link,
          excerpt: desc.replace(/<[^>]*>/g, '').slice(0, 200),
          image,
          published: pubDate,
          source: '',
          source_color: '',
        });
      }
    });

    return items;
  } catch {
    return [];
  }
}

router.get('/rss', async (req: Request, res: Response) => {
  try {
    const { source = 'all', limit = '8' } = req.query as { source?: string; limit?: string };
    const limitNum = parseInt(limit) || 8;

    let sourcesToFetch: string[];
    if (source === 'all') {
      sourcesToFetch = Object.keys(SOURCES);
    } else if (SOURCES[source]) {
      sourcesToFetch = [source];
    } else {
      res.status(400).json({ error: 'Invalid source' });
      return;
    }

    const results = await Promise.all(
      sourcesToFetch.map(async (src) => {
        const items = await fetchRss(SOURCES[src].url);
        return items.map((item) => ({
          ...item,
          source: SOURCES[src].name,
          source_color: SOURCES[src].color,
        }));
      })
    );

    const allItems = results.flat().sort((a, b) => {
      return new Date(b.published).getTime() - new Date(a.published).getTime();
    });

    res.json({ items: allItems.slice(0, limitNum) });
  } catch (err) {
    console.error('RSS error:', err);
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
});

export default router;
