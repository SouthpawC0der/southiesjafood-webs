import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const isProtectedRoute = createRouteMatcher(["/account(.*)", "/checkout(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // ── Rate limiting on API routes ──────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const { allowed, remaining, resetIn } = await checkRateLimit(ip);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(resetIn / 1000)),
            "X-RateLimit-Limit": String(parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "60")),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  }

  // ── Auth guard: Clerk session required for account & checkout ────────────
  if (isProtectedRoute(request)) {
    await auth.protect(); // redirects unauthenticated users to sign-in
  }

  // ── Security headers ─────────────────────────────────────────────────────
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
