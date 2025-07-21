
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('auth-session');
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    if (!cookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    try {
      const session = JSON.parse(cookie.value);
      if (session?.role !== 'admin') {
         return NextResponse.redirect(new URL('/clerk', request.url));
      }
      // If user is admin and accessing admin route, allow them
      return NextResponse.next();
    } catch (e) {
      // Invalid cookie
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth-session');
      return response;
    }
  }
  
  // If the user is logged in and tries to access the main login page, redirect them
  if (pathname === '/' && cookie) {
    try {
       const session = JSON.parse(cookie.value);
       const redirectUrl = session.role === 'admin' ? '/admin' : '/clerk';
       return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (e) {
       // Invalid cookie, let them stay on the login page but clear the cookie
       const response = NextResponse.next();
       response.cookies.delete('auth-session');
       return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/logout|_next/static|_next/image|favicon.ico|notification.mp3).*)'],
}
