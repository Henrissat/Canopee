import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

function isPublicPath(pathname: string): boolean {
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/register"
  ) {
    return true;
  }

  if (pathname === "/" || pathname === "/plantes") return true;

  if (
    pathname.startsWith("/plantes/") &&
    pathname !== "/plantes/nouvelle" &&
    !pathname.includes("/modifier")
  ) {
    return true;
  }

  return false;
}

function isWriteApi(pathname: string, method: string): boolean {
  if (method === "GET" || method === "HEAD") return false;
  return pathname.startsWith("/api/");
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const method = req.method;
  const isLoggedIn = !!req.auth;

  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  if (isWriteApi(pathname, method) && !isLoggedIn) {
    if (pathname.startsWith("/api/auth") || pathname === "/api/register") {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
