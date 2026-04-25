import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/reset-password',
    '/forget-password',
    '/api/auth/login',
    '/api/auth/register',
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === '/') {
      return pathname === route;
    }

    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For API routes, check for token
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // For page routes, redirect to login if no token
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}