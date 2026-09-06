import { Redis } from "@upstash/redis";

/**
 * Shared storage for pending sign-ins.
 *
 * A PIN is written by the Kodi device (POST /pin), read and updated by the
 * browser (/authorize, /callback), then read back by Kodi (GET /pin/{pin}).
 * Those requests can land on different serverless instances, so the data has
 * to live outside the process. Redis is used when it is configured; the
 * in-memory map is only a local-development fallback and is not shared.
 */

type Entry = { value: unknown; expiresAt: number };

const memory = new Map<string, Entry>();

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

export const isShared = Boolean(redis);

export async function get<T>(key: string): Promise<T | null> {
  if (redis) return (await redis.get<T>(key)) ?? null;

  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry.value as T;
}

export async function set(key: string, value: unknown, ttlSeconds: number) {
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function has(key: string) {
  return (await get(key)) !== null;
}

export async function del(key: string) {
  if (redis) {
    await redis.del(key);
    return;
  }
  memory.delete(key);
}

/** Remaining lifetime in seconds, or -2 when the key is gone. */
export async function ttl(key: string): Promise<number> {
  if (redis) return await redis.ttl(key);

  const entry = memory.get(key);
  if (!entry) return -2;

  const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
  return remaining > 0 ? remaining : -2;
}
