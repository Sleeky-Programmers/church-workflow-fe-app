// Small in-memory request cache for rarely-changing reference data (offering
// Types, currencies, payment methods, ...). It dedupes concurrent requests and
// Serves repeat reads for a short TTL, so pages stop refetching the same lists
// On every visit. Mutations must call invalidateCache for the affected key.

interface CacheEntry<T> {
  expiresAt: number;
  promise: Promise<T>;
}

const entries = new Map<string, CacheEntry<unknown>>();

export function cachedRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 60_000,
): Promise<T> {
  const now = Date.now();
  const hit = entries.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > now) {
    return hit.promise;
  }

  const promise = fetcher().catch((error: unknown) => {
    // Never cache a failure.
    entries.delete(key);
    throw error;
  });
  entries.set(key, { expiresAt: now + ttlMs, promise });
  return promise;
}

export function invalidateCache(keyPrefix?: string) {
  if (!keyPrefix) {
    entries.clear();
    return;
  }
  for (const key of Array.from(entries.keys())) {
    if (key.startsWith(keyPrefix)) {
      entries.delete(key);
    }
  }
}
