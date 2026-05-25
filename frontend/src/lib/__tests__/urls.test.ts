import { describe, it, expect } from 'vitest';
import { getArticleUrl } from '../urls';

describe('getArticleUrl', () => {
  it('returns root-level slug URL when slug is present', () => {
    const result = getArticleUrl({ id: '5', slug: 'my-article' } as any);
    expect(result).toBe('/my-article');
  });

  it('falls back to /article/:id when no slug', () => {
    const result = getArticleUrl({ id: '5' } as any);
    expect(result).toBe('/article/5');
  });
});
