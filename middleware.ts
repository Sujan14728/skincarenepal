import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequestEdge, hasRequiredRole } from "./lib/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("Middleware running for:", pathname);

  // Skip login and register pages
  if (
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/dashboard/login") &&
    !pathname.startsWith("/dashboard/register")
  ) {

    const user = await getUserFromRequestEdge(req);

    // Verify token
    try {
      if (!hasRequiredRole(user, ["admin"])) {
        return NextResponse.redirect(new URL("/dashboard/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/dashboard/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
