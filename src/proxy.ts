import { NextRequest, NextResponse } from 'next/server';

import { AUTH_ROUTES, PROTECTED_ROUTES } from '@/shared/const/routes.const';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ??
    req.cookies.get('__Secure-authjs.session-token')?.value;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected && !sessionToken) {
    const loginUrl = new URL('/sign-in', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*', '/sign-in', '/sign-up'],
};
