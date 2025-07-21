
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/admin', '/clerk'];
const ADMIN_ROUTES = ['/admin'];

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('auth-session');
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // 1. If user is not logged in and tries to access a protected route
  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // 2. If user is logged in
  if (cookie) {
    try {
      const session = JSON.parse(cookie.value);
      
      // 2a. If user is logged in and tries to access login page, redirect to their dashboard
      if (pathname === '/') {
        const redirectUrl = session.role === 'admin' ? '/admin' : '/clerk';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // 2b. If a non-admin user tries to access an admin route, redirect to clerk dashboard
      const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
      if (isAdminRoute && session.role !== 'admin') {
         return NextResponse.redirect(new URL('/clerk', request.url));
      }

    } catch (e) {
      // 2c. If cookie is invalid, delete it and redirect to login
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth-session');
      return response;
    }
  }

  // 3. Allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|public/|_next/static|_next/image|favicon.ico|notification.mp3).*)'],
};
