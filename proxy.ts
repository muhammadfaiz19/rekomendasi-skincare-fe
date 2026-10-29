import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Proxy/Middleware function (Server-side only).
 * This runs on the Edge Runtime.
 */
export default async function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Protect Dashboard Routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Prevent logged in users from visiting login page
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
