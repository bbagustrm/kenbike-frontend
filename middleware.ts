import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ DEBUGGING: Log setiap request (hapus setelah fix)
  console.log(`[Middleware] ${req.method} ${pathname}`);

  // Get tokens from cookies
  const accessToken = req.cookies.get("access_token")?.value;
  const userCookie = req.cookies.get("user")?.value;

  // ✅ PERBAIKAN: Skip middleware untuk Next.js internal routes
  if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes("/favicon.ico") ||
      pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Define route types
  const isAuthRoute =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password");

  const isPublicRoute =
      pathname === "/" ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/products") ||
      pathname.startsWith("/contact") ||
      pathname.startsWith("/search") ||
      pathname === "/unauthorized"; // ✅ TAMBAH ini

  const isDashboardRoute =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/owner") ||
      pathname.startsWith("/user");

  // If user is on auth route and already authenticated, redirect to appropriate dashboard
  if (isAuthRoute && accessToken && userCookie) {
    try {
      const user = JSON.parse(userCookie);
      console.log(`[Middleware] Auth route with user: ${user.role}`);

      if (user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else if (user.role === "OWNER") {
        return NextResponse.redirect(new URL("/owner/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("[Middleware] Error parsing user cookie:", error);
    }
  }

  // Public routes - allow everyone
  if (isPublicRoute) {
    console.log(`[Middleware] Public route: ${pathname}`);
    return NextResponse.next();
  }

  // Dashboard routes - require authentication
  if (isDashboardRoute) {
    console.log(`[Middleware] Dashboard route: ${pathname}`);

    // Check if user is authenticated
    if (!accessToken || !userCookie) {
      console.log(`[Middleware] Not authenticated, redirecting to login`);

      // ✅ PERBAIKAN: Prevent redirect loop
      if (pathname === "/login") {
        return NextResponse.next();
      }

      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    try {
      const user = JSON.parse(userCookie);
      const role = user.role;

      console.log(`[Middleware] User role: ${role}, checking access for: ${pathname}`);

      // Admin routes - only ADMIN can access
      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        console.log(`[Middleware] Admin access denied for role: ${role}`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // Owner routes - only OWNER can access
      if (pathname.startsWith("/owner") && role !== "OWNER") {
        console.log(`[Middleware] Owner access denied for role: ${role}`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // User routes - only USER can access
      if (pathname.startsWith("/user") && role !== "USER") {
        console.log(`[Middleware] User access denied for role: ${role}`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      console.log(`[Middleware] Access granted for ${pathname}`);
    } catch (error) {
      console.error("[Middleware] Error checking user role:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};