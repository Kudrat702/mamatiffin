// Simple in-memory cache with TTL (Time To Live)
// Cache resets on page refresh — perfect for menu/location data

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const TTL = {
  MENU: 5 * 60 * 1000,      // 5 minutes — menus change rarely
  LOCATION: 15 * 60 * 1000, // 15 minutes — locations almost never change
};

export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttl: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttl });
}

export function clearCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) store.delete(key);
  }
}

// Fetch with cache — drop-in replacement for fetch()
export async function cachedFetch<T>(
  url: string,
  ttl: number,
  options?: RequestInit
): Promise<T> {
  const cached = getCache<T>(url);
  if (cached !== null) return cached;

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);

  const data = (await response.json()) as T;
  setCache(url, data, ttl);
  return data;
}
