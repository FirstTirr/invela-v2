import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika user mengakses Root URL (/)
  if (pathname === '/') {
    if (!token || !userRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Redirect langsung ke folder role user masing-masing
    return NextResponse.redirect(new URL(`/${userRole}`, request.url));
  }

  // 2. Jika user mencoba mengakses /login padahal sudah login
  if (pathname === '/login' && token && userRole) {
    return NextResponse.redirect(new URL(`/${userRole}`, request.url));
  }

  // 3. Proteksi Route Berdasarkan Role
  const roleRoutes: Record<string, string[]> = {
    '/admin': ['admin'],
    '/kabeng': ['kabeng', 'admin'],
    '/kaprog': ['kaprog', 'admin'],
    '/sapras': ['sapras', 'admin'],
    '/guru': ['guru', 'admin'],
  };

  const matchedRoute = Object.keys(roleRoutes).find((route) => pathname.startsWith(route));

  // Jika mencoba akses route terproteksi tapi BELUM LOGIN
  if (matchedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika SUDAH LOGIN tapi mencoba masuk ke route role lain yang tidak diizinkan
  if (matchedRoute && userRole) {
    const allowedRoles = roleRoutes[matchedRoute];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/kabeng/:path*',
    '/kaprog/:path*',
    '/sapras/:path*',
    '/guru/:path*',
  ],
};