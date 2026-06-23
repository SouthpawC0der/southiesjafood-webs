import { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000");
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "60");

// ── In-memory fallback (dev / no Upstash configured) ─────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkInMemory(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }
  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetIn: entry.resetTime - now };
}

// Cleanup old in-memory entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) rateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000);
}

// ── Upstash distributed rate limiting (production) ────────────────────────────
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env vars.
// Falls back to in-memory silently when not configured or on error.
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(MAX_REQUESTS, `${Math.floor(WINDOW_MS / 1000)} s`),
        analytics: true,
        prefix: "sja_rl",
      })
    : null;

// ── Public API ────────────────────────────────────────────────────────────────

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  key: string
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  if (ratelimit) {
    try {
      const { success, remaining, reset } = await ratelimit.limit(key);
      return { allowed: success, remaining, resetIn: Math.max(0, reset - Date.now()) };
    } catch (err) {
      console.error("[rate-limit] Upstash error, falling back to in-memory:", err);
    }
  }
  return checkInMemory(key);
}
