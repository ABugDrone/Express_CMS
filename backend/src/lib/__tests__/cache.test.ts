import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryCache, cacheKey } from '../cache.js';

describe('MemoryCache', () => {
  let cache: MemoryCache<string>;

  beforeEach(() => {
    cache = new MemoryCache<string>(100);
  });

  it('sets and gets a value', () => {
    cache.set('key1', 'value1', 10000);
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns null for missing key', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('expires entries after TTL', async () => {
    const shortCache = new MemoryCache<string>(100);
    shortCache.set('key', 'value', 20);
    await new Promise(r => setTimeout(r, 50));
    expect(shortCache.get('key')).toBeNull();
  });

  it('deletes a key', () => {
    cache.set('key', 'value', 10000);
    cache.del('key');
    expect(cache.get('key')).toBeNull();
  });

  it('clears all keys', () => {
    cache.set('a', '1', 10000);
    cache.set('b', '2', 10000);
    cache.clear();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });

  it('evicts oldest entries when over limit', () => {
    const smallCache = new MemoryCache<string>(2);
    smallCache.set('a', '1', 10000);
    smallCache.set('b', '2', 10000);
    smallCache.set('c', '3', 10000);
    expect(smallCache.get('a')).toBeNull();
    expect(smallCache.get('b')).toBe('2');
    expect(smallCache.get('c')).toBe('3');
  });

  it('cacheKey generates correct keys', () => {
    expect(cacheKey('articles', 'list', 'page=1'))
      .toBe('articles:list:page=1');
  });
});
