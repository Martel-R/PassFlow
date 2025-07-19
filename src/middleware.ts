
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('auth-session');
  const { pathname } = request.nextUrl;

  const protectedAdminRoutes = ['/admin'];
  const protectedClerkRoutes = ['/clerk'];
  
  const isPublicRoute = ['/', '/get-ticket', '/display'].includes(pathname);
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isAdminRoute = protectedAdminRoutes.some(p => pathname.startsWith(p));
  const isClerkRoute = protectedClerkRoutes.some(p => pathname.startsWith(p));

  // If trying to access a protected route without a session cookie
  if (!cookie && (isAdminRoute || isClerkRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If there is a session cookie
  if (cookie) {
    try {
      const session = JSON.parse(cookie.value);
      const { role } = session;

      // If user is not admin and tries to access admin routes
      if (isAdminRoute && role !== 'admin') {
         const url = request.nextUrl.clone();
         url.pathname = '/clerk'; // Redirect clerk to their own dashboard
         return NextResponse.redirect(url);
      }
      
      // If user is not clerk or admin and tries to access clerk route
      if (isClerkRoute && role !== 'clerk' && role !== 'admin') {
         const url = request.nextUrl.clone();
         url.pathname = '/'; // Redirect to login
         return NextResponse.redirect(url);
      }
      
    } catch (e) {
      // Invalid cookie, treat as logged out
      const url = request.nextUrl.clone();
      url.pathname = '/';
      const response = NextResponse.redirect(url);
      response.cookies.delete('auth-session'); // Clear the invalid cookie
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Matcher avoids running middleware on static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
