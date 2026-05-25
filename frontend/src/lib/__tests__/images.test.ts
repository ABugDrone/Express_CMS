import { describe, it, expect } from 'vitest';
import { getThumbnailUrl, getSrcSet, getResizedUrl } from '../images';

describe('image utilities', () => {
  it('getThumbnailUrl returns variant path for local uploads', () => {
    const result = getThumbnailUrl('/uploads/abc.jpg');
    expect(result).toBe('/uploads/_variants/abc_thumb.webp');
  });

  it('getThumbnailUrl returns original for external URLs', () => {
    const result = getThumbnailUrl('https://example.com/img.jpg');
    expect(result).toBe('https://example.com/img.jpg');
  });

  it('getResizedUrl returns API resize URL', () => {
    const result = getResizedUrl('/uploads/abc.jpg', 400, 'webp');
    expect(result).toContain('/api/images/resize');
    expect(result).toContain('w=400');
    expect(result).toContain('format=webp');
  });

  it('getSrcSet returns null for external URLs', () => {
    const result = getSrcSet('https://example.com/img.jpg');
    expect(result).toBeNull();
  });
});
