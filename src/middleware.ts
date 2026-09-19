import { NextResponse, type NextRequest } from "next/server";

const PORTAL_SESSION_COOKIE = "buddas_portal_session";
const OPERATOR_FIREBASE_SESSION_COOKIE = "buddas_operator_session";
const CORPORATE_FIREBASE_SESSION_COOKIE = "buddas_corporate_session";
const SUPABASE_ACCESS_TOKEN_COOKIE = "sb-access-token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isCorporateRoute =
    pathname === "/corporate" ||
    pathname.startsWith("/corporate/") ||
    pathname === "/api/corporate" ||
    pathname.startsWith("/api/corporate/");
  const isPortalRoute =
    pathname === "/portal" ||
    pathname.startsWith("/portal/") ||
    pathname === "/api/portal" ||
    pathname.startsWith("/api/portal/");

  if (!isPortalRoute && !isCorporateRoute) {
    return NextResponse.next();
  }

  // Check for any of the portal authentication tokens/cookies
  const hasPortalCookie = isCorporateRoute
    ? request.cookies.has(CORPORATE_FIREBASE_SESSION_COOKIE)
    : request.cookies.has(PORTAL_SESSION_COOKIE) || request.cookies.has(OPERATOR_FIREBASE_SESSION_COOKIE) || request.cookies.has(SUPABASE_ACCESS_TOKEN_COOKIE);

  // If unauthenticated: immediately redirect before executing any portal page or API logic
  if (!hasPortalCookie) {
    const loginUrl = new URL("/franchise/login", request.url);
    if (isCorporateRoute) {
      loginUrl.searchParams.set("access", "corporate");
    }
    const response = NextResponse.redirect(loginUrl, 307);

    // Apply strict anti-indexing and anti-caching headers on the redirect response
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet",
    );
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );
    response.headers.set("Pragma", "no-cache");
    return response;
  }

  // If authenticated: proceed with request but enforce strict anti-indexing headers
  const response = NextResponse.next();
  response.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noarchive, nosnippet",
  );
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0",
  );
  response.headers.set("Pragma", "no-cache");
  return response;
}

export const config = {
  matcher: ["/portal/:path*", "/portal", "/api/portal/:path*", "/api/portal", "/corporate/:path*", "/corporate", "/api/corporate/:path*", "/api/corporate"],
};
