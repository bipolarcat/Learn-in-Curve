import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Permanent redirects for the old PFQ subtree → `/courses/pfq-in-2-days/*`.
 * Must ship in the same deploy as the route move.
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
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
