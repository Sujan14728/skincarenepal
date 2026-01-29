import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromRequestEdge, hasRequiredRole } from './lib/auth-edge';
import { globalRatelimit } from './lib/rate-limit';

const getClientIdentifier = (req: NextRequest) => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim();

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'anonymous';
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const identifier = getClientIdentifier(req);
  const rate = await globalRatelimit.limit(identifier);

  const rateLimitHeaders = new Headers({
    'X-RateLimit-Limit': `${rate.limit}`,
    'X-RateLimit-Remaining': `${Math.max(0, rate.remaining)}`,
    'X-RateLimit-Reset': `${rate.reset}`
  });

  if (!rate.success) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((rate.reset - Date.now()) / 1000)
    );

    rateLimitHeaders.set('Retry-After', `${retryAfterSeconds}`);

    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: rateLimitHeaders
    });
  }

  // Skip login and register pages
  if (
    pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/dashboard/login') &&
    !pathname.startsWith('/dashboard/register')
  ) {
    const user = await getUserFromRequestEdge(req);

    // Verify token
    try {
      if (!hasRequiredRole(user, ['admin'])) {
        return NextResponse.redirect(
          new URL('/dashboard/login', req.nextUrl.origin)
        );
      }
    } catch {
      return NextResponse.redirect(
        new URL('/dashboard/login', req.nextUrl.origin)
      );
    }
  }

  const response = NextResponse.next({ headers: rateLimitHeaders });
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
};
