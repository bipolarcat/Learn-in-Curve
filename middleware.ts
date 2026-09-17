import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Permanent redirects for the old PFQ subtree → `/courses/pfq-in-2-days/*`.
 * Must ship in the same deploy as the route move. next.config.ts also lists
 * these redirects as a belt-and-braces layer.
 */
function redirectLegacyPfq(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  if (pathname !== "/pfq" && !pathname.startsWith("/pfq/")) {
    return null;
  }
  const suffix = pathname === "/pfq" ? "" : pathname.slice("/pfq".length);
  const url = request.nextUrl.clone();
  url.pathname = `/courses/pfq-in-2-days${suffix}`;
  url.search = search;
  return NextResponse.redirect(url, 301);
}

export async function middleware(request: NextRequest) {
  const legacy = redirectLegacyPfq(request);
  if (legacy) return legacy;
  const response = await updateSession(request);
  // Dev + phone LAN: stop Safari keeping stale HTML after edits.
  if (process.env.NODE_ENV === "development") {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );
    response.headers.set("Pragma", "no-cache");
  }
  return response;
}

export const config = {
  matcher: [
    "/pfq",
    "/pfq/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
