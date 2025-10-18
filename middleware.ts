// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get tokens from cookies
  const accessToken = req.cookies.get("access_token")?.value;
  const userCookie = req.cookies.get("user")?.value;

  // Define route types
  const isAuthRoute = pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password");

  const isPublicRoute = pathname === "/" ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/products") ||
      pathname.startsWith("/contact") ||
      pathname.startsWith("/search");

  const isDashboardRoute = pathname.startsWith("/admin") ||
      pathname.startsWith("/owner") ||
      pathname.startsWith("/user");

  // If user is on auth route and already authenticated, redirect to appropriate dashboard
  if (isAuthRoute && accessToken && userCookie) {
    try {
      const user = JSON.parse(userCookie);

      if (user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else if (user.role === "OWNER") {
        return NextResponse.redirect(new URL("/owner/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Error parsing user cookie:", error);
    }
  }

  // Public routes - allow everyone
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Dashboard routes - require authentication
  if (isDashboardRoute) {
    // Check if user is authenticated
    if (!accessToken || !userCookie) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    try {
      const user = JSON.parse(userCookie);
      const role = user.role;

      // Admin routes - only ADMIN can access
      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // Owner routes - only OWNER can access
      if (pathname.startsWith("/owner") && role !== "OWNER") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // User routes - only USER can access (optional based on your needs)
      if (pathname.startsWith("/user") && role !== "USER") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};