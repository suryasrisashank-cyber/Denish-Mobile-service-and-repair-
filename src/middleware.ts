import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cleanPath = pathname.replace(/\/+$/, "") || "/";

  // Allow admin login endpoint and page publicly (with or without trailing slashes)
  if (cleanPath === "/admin/login" || cleanPath === "/api/admin/login") {
    return NextResponse.next();
  }

  const cookieToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authHeader = request.headers.get("Authorization");
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : undefined;

  const isCookieValid = cookieToken ? Boolean(await verifySessionToken(cookieToken)) : false;
  const isBearerValid = bearerToken ? Boolean(await verifySessionToken(bearerToken)) : false;

  // Protect Admin API routes at the edge
  if (cleanPath.startsWith("/api/admin")) {
    if (!isCookieValid && !isBearerValid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Protect Admin UI pages (/admin, /admin/new-order, /admin/orders/*)
  if (cleanPath.startsWith("/admin")) {
    if (!isCookieValid) {
      const loginUrl = new URL("/admin/login", request.url);
      if (cleanPath !== "/admin" && cleanPath.startsWith("/admin/")) {
        loginUrl.searchParams.set("next", cleanPath);
      }
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

