type CacheEntry<T> = { data: T; expiresAt: number };

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    if (this.store.size >= this.maxSize) {
      // Evict oldest entry
      const oldest = this.store.keys().next().value;
      if (oldest) this.store.delete(oldest);
    }
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get stats() {
    return { size: this.store.size, maxSize: this.maxSize };
  }
}

export const cache = new MemoryCache(500);

export const TTL = {
  CONFIG: 5 * 60 * 1000,      // 5 min — site config rarely changes
  ARTICLES: 2 * 60 * 1000,    // 2 min — articles update frequently
  ARTICLES_LIST: 60 * 1000,   // 1 min — listing pages
  NEWS_TYPES: 10 * 60 * 1000, // 10 min — news types are static
  SOCIALS: 10 * 60 * 1000,    // 10 min
  CATEGORIES: 10 * 60 * 1000,
};

export function cacheKey(...parts: string[]): string {
  return parts.join(':');
}
