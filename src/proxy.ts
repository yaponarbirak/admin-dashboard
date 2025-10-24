import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // This is a simple middleware - we'll enhance it with actual auth checks
  // For now, we'll just allow all requests to pass through
  // The actual auth check happens in the AuthProvider component

  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/login"];

  // If user is on a public path, allow access
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For protected routes, let the client-side AuthProvider handle it
  // This ensures we don't have hydration mismatches
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
