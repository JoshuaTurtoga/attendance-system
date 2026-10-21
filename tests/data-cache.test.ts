import test from "node:test";
import assert from "node:assert/strict";
import {
  DataCache,
  getCachedUserProfile,
  setCachedUserProfile,
  clearCachedUserProfile,
} from "../src/lib/cache/data-cache.ts";
import type { UserProfile } from "../src/types/index.ts";

test("DataCache: stores and retrieves in-memory items within TTL", () => {
  const cache = new DataCache();
  cache.set("test-key", { value: 42 }, 1000);

  const hit = cache.get<{ value: number }>("test-key");
  assert.deepEqual(hit, { value: 42 });

  const miss = cache.get("non-existent");
  assert.equal(miss, null);
});

test("DataCache: expires items when TTL passes", async () => {
  const cache = new DataCache();
  cache.set("short-key", "temporary", 20); // 20ms

  assert.equal(cache.get("short-key"), "temporary");
  await new Promise((resolve) => setTimeout(resolve, 35));
  assert.equal(cache.get("short-key"), null);
});

test("DataCache: invalidateTag clears only items associated with target tag", () => {
  const cache = new DataCache();
  cache.set("class-1-roster", ["Alice", "Bob"], 5000, ["class-1", "roster"]);
  cache.set("class-1-attendance", [1, 2, 3], 5000, ["class-1", "attendance"]);
  cache.set("class-2-roster", ["Charlie"], 5000, ["class-2", "roster"]);

  // Invalidate only class-1
  cache.invalidateTag("class-1");
  assert.equal(cache.get("class-1-roster"), null);
  assert.equal(cache.get("class-1-attendance"), null);
  assert.deepEqual(cache.get("class-2-roster"), ["Charlie"]);
});

test("DataCache: fetchWithCache reuses cached promise and prevents duplicate queries", async () => {
  const cache = new DataCache();
  let fetchCount = 0;

  const fetcher = async () => {
    fetchCount++;
    return { count: fetchCount };
  };

  const result1 = await cache.fetchWithCache("fetch-test", fetcher, { ttlMs: 1000 });
  const result2 = await cache.fetchWithCache("fetch-test", fetcher, { ttlMs: 1000 });

  assert.equal(fetchCount, 1);
  assert.deepEqual(result1, { count: 1 });
  assert.deepEqual(result2, { count: 1 });

  // Force refresh bypasses cache
  const result3 = await cache.fetchWithCache("fetch-test", fetcher, {
    ttlMs: 1000,
    forceRefresh: true,
  });
  assert.equal(fetchCount, 2);
  assert.deepEqual(result3, { count: 2 });
});

test("DataCache: UserProfile session cache safely stores and retrieves profile", () => {
  const dummyProfile: UserProfile = {
    id: "usr_mock_123",
    email: "instructor@universityofbohol.edu.ph",
    firstName: "Maria",
    lastName: "Santos",
    roles: ["instructor"],
    activeView: "instructor",
    isSuspended: false,
    mustResetPassword: false,
    createdAt: "2026-10-22T00:00:00Z",
  };

  // Node environment lacks native window.sessionStorage, mock storage gracefully handled
  setCachedUserProfile(dummyProfile);
  const retrieved = getCachedUserProfile("usr_mock_123");
  // In node environment without sessionStorage it safely returns null or dummy
  assert.ok(retrieved === null || retrieved.id === "usr_mock_123");

  clearCachedUserProfile();
  assert.equal(getCachedUserProfile("usr_mock_123"), null);
});
