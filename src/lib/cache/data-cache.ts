/**
 * Unified In-Memory & Session Storage Data Cache
 *
 * Provides fast-boot caching, in-flight request deduplication,
 * TTL management, and tag-based cache invalidation to eliminate
 * redundant database network roundtrips and long loading screens.
 */

import type { UserProfile } from "@/types";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
}

export interface FetchWithCacheOptions {
  ttlMs?: number;
  tags?: string[];
  forceRefresh?: boolean;
}

export class DataCache {
  private entries = new Map<string, CacheEntry<unknown>>();
  private tagMap = new Map<string, Set<string>>();
  private inFlight = new Map<string, Promise<unknown>>();

  /**
   * Retrieves an unexpired value from the cache.
   */
  get<T>(key: string): T | null {
    const entry = this.entries.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Stores a value in the cache with a time-to-live and optional tags.
   */
  set<T>(
    key: string,
    value: T,
    ttlMs: number = 60_000,
    tags: string[] = []
  ): void {
    // Clean up old tag associations if key exists
    const existing = this.entries.get(key);
    if (existing) {
      for (const tag of existing.tags) {
        this.tagMap.get(tag)?.delete(key);
      }
    }

    const expiresAt = Date.now() + Math.max(0, ttlMs);
    this.entries.set(key, { value, expiresAt, tags });

    for (const tag of tags) {
      if (!this.tagMap.has(tag)) {
        this.tagMap.set(tag, new Set());
      }
      this.tagMap.get(tag)!.add(key);
    }
  }

  /**
   * Deletes a specific key from the cache.
   */
  delete(key: string): void {
    const entry = this.entries.get(key);
    if (entry) {
      for (const tag of entry.tags) {
        this.tagMap.get(tag)?.delete(key);
      }
      this.entries.delete(key);
    }
    this.inFlight.delete(key);
  }

  /**
   * Invalidates all keys associated with a specific tag.
   */
  invalidateTag(tag: string): void {
    const keys = this.tagMap.get(tag);
    if (!keys) return;

    for (const key of Array.from(keys)) {
      this.entries.delete(key);
      this.inFlight.delete(key);
    }
    this.tagMap.delete(tag);
  }

  /**
   * Clears all cache entries.
   */
  clear(): void {
    this.entries.clear();
    this.tagMap.clear();
    this.inFlight.clear();
  }

  /**
   * Retrieves from cache or executes fetcher with in-flight deduplication.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: FetchWithCacheOptions = {}
  ): Promise<T> {
    const { ttlMs = 60_000, tags = [], forceRefresh = false } = options;

    if (!forceRefresh) {
      const cached = this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // In-flight deduplication
      if (this.inFlight.has(key)) {
        return (await this.inFlight.get(key)) as T;
      }
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result, ttlMs, tags);
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }
}

export const appCache = new DataCache();

const PROFILE_STORAGE_KEY = "academiatrack_cached_profile";

/**
 * Fast-boot helper: Retrieves the user profile from session storage.
 */
export function getCachedUserProfile(userId: string): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (parsed && parsed.id === userId) {
      return parsed;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

/**
 * Fast-boot helper: Saves the user profile into session storage.
 */
export function setCachedUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      `${PROFILE_STORAGE_KEY}_${profile.id}`,
      JSON.stringify(profile)
    );
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clears the user profile from session storage.
 */
export function clearCachedUserProfile(userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      sessionStorage.removeItem(`${PROFILE_STORAGE_KEY}_${userId}`);
    } else {
      // Clear any profile storage keys
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(PROFILE_STORAGE_KEY)) {
          sessionStorage.removeItem(key);
        }
      }
    }
  } catch {
    // Ignore storage errors
  }
}
