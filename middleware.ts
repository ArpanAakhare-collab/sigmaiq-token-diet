import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  // Bypass static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const isAuthenticated = Boolean(sessionCookie && sessionCookie.length > 10);

  // Root redirect
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/app", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Unauthenticated access to /app/* -> redirect to /login
  if (!isAuthenticated && pathname.startsWith("/app")) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated access to auth pages (/login, /register, /forgot-password) -> redirect to /app
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";
  if (isAuthenticated && isAuthPage) {
    const appUrl = new URL("/app", request.url);
    return NextResponse.redirect(appUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/forgot-password", "/app", "/app/:path*"],
};
