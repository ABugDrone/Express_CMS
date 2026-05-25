import slugify from 'slugify';
import { prisma } from './prisma.js';

export function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

export async function uniqueSlug(title: string, table: 'article' | 'theme' | 'newsType' | 'legalPage', excludeId?: number): Promise<string> {
  const base = generateSlug(title);
  let slug = base;
  let counter = 1;

  while (await slugExists(slug, table, excludeId)) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

async function slugExists(slug: string, table: string, excludeId?: number): Promise<boolean> {
  switch (table) {
    case 'article': {
      const existing = await prisma.article.findUnique({ where: { slug } });
      if (!existing) return false;
      return excludeId ? existing.id !== excludeId : true;
    }
    case 'theme': {
      const existing = await prisma.theme.findUnique({ where: { slug } });
      if (!existing) return false;
      return excludeId ? existing.id !== excludeId : true;
    }
    case 'newsType': {
      const existing = await prisma.newsType.findUnique({ where: { slug } });
      if (!existing) return false;
      return excludeId ? existing.id !== excludeId : true;
    }
    case 'legalPage': {
      const existing = await prisma.legalPage.findUnique({ where: { slug } });
      if (!existing) return false;
      return excludeId ? existing.id !== excludeId : true;
    }
    default:
      return false;
  }
}
