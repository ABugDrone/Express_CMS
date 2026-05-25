import { describe, it, expect } from 'vitest';
import { getVariantPath, getVariantUrl, getSrcSet, getThumbnailUrl, THUMBNAIL_VARIANTS } from '../imageProcessor.js';

describe('imageProcessor URL helpers', () => {
  const urls = {
    jpg: { path: '/uploads/abc.jpg' },
    png: { path: '/uploads/img.png' },
  };

  it('getVariantPath returns correct path', () => {
    const variant = THUMBNAIL_VARIANTS.find(v => v.suffix === 'md' && v.format === 'webp')!;
    const result = getVariantPath(urls.jpg.path, variant);
    expect(result).toContain('_variants');
    expect(result).toContain('abc_md.webp');
  });

  it('getVariantUrl returns correct URL', () => {
    const variant = THUMBNAIL_VARIANTS.find(v => v.suffix === 'lg' && v.format === 'jpeg')!;
    const result = getVariantUrl(urls.png.path, variant);
    expect(result).toContain('_variants');
    expect(result).toContain('img_lg.jpeg');
    expect(result).toContain('/uploads/');
  });

  it('getSrcSet returns all sizes', () => {
    const result = getSrcSet(urls.jpg.path);
    expect(result.webp).toContain('400w');
    expect(result.webp).toContain('800w');
    expect(result.webp).toContain('1200w');
    expect(result.jpeg).toContain('400w');
    expect(result.jpeg).toContain('800w');
    expect(result.jpeg).toContain('1200w');
  });

  it('getThumbnailUrl returns thumb variant', () => {
    const result = getThumbnailUrl(urls.jpg.path);
    expect(result).toContain('thumb');
    expect(result).toContain('.webp');
  });
});
