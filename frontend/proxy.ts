import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdmin = pathname.startsWith("/admin");
  const isProtected = pathname.startsWith("/profile") ||
                      pathname.startsWith("/admin") ||
                      pathname.startsWith("/culture");

  if ((isProtected || isAdmin) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/culture/:path*", "/explore/:path*", 
            "/profile/:path*", "/admin/:path*", 
            "/chat", "/login", "/register"],
};