import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin route protection
  if (pathname.startsWith("/admin")) {
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    // In production, strictly redirect to login if no session token cookie is found
    if (!sessionToken && process.env.NODE_ENV === "production") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Optional Arcjet Shield in production
  if (process.env.ARCJET_KEY && process.env.NODE_ENV === "production") {
    try {
      const { aj } = await import("@/lib/arcjet");
      const decision = await aj.protect(request);
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 },
          );
        }
        if (decision.reason.isBot()) {
          return NextResponse.json(
            { error: "Automated bot traffic is not permitted." },
            { status: 403 },
          );
        }
        return NextResponse.json(
          { error: "Access denied by security shield." },
          { status: 403 },
        );
      }
    } catch {
      // Continue gracefully if Arcjet encounters an issue
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
