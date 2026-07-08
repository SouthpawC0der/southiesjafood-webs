import { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000");
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "60");

// ── In-memory fallback (dev / no Upstash configured) ─────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkInMemory(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: max - 1, resetIn: windowMs };
  }
  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }
  entry.count++;
  return { allowed: true, remaining: max - entry.count, resetIn: entry.resetTime - now };
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) rateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000);
}

// ── Upstash distributed rate limiters ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeUpstashLimiter(max: number, window: string): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    limiter: Ratelimit.slidingWindow(max, window as any),
    analytics: true,
    prefix: "sja_rl",
  });
}

const defaultWindow = `${Math.floor(WINDOW_MS / 1000)} s`;

const limiters = {
  default:  { upstash: makeUpstashLimiter(MAX_REQUESTS, defaultWindow), max: MAX_REQUESTS, windowMs: WINDOW_MS },
  checkout: { upstash: makeUpstashLimiter(5,  "60 s"),                  max: 5,            windowMs: 60_000    },
  contact:  { upstash: makeUpstashLimiter(3,  "3600 s"),                max: 3,            windowMs: 3_600_000 },
} as const;

export type RateLimitTier = keyof typeof limiters;

// ── Public API ────────────────────────────────────────────────────────────────

export function getClientIp(request: NextRequest): string {
  // x-real-ip is set authoritatively by Vercel's edge and cannot be spoofed by clients
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  // Fallback for local dev — leftmost XFF is acceptable when there's no trusted proxy header
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function checkRateLimit(
  key: string,
  tier: RateLimitTier = "default"
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const { upstash, max, windowMs } = limiters[tier];
  if (upstash) {
    try {
      const { success, remaining, reset } = await upstash.limit(key);
      return { allowed: success, remaining, resetIn: Math.max(0, reset - Date.now()) };
    } catch (err) {
      console.error("[rate-limit] Upstash error, falling back to in-memory:", err);
    }
  }
  return checkInMemory(key, max, windowMs);
}
