
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('auth-session');
  const { pathname } = request.nextUrl;

  const protectedAdminRoutes = ['/admin'];
  const protectedClerkRoutes = ['/clerk'];
  
  const isPublicRoute = ['/', '/get-ticket', '/display'].includes(pathname) || pathname.startsWith('/api/login');
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isAdminRoute = protectedAdminRoutes.some(p => pathname.startsWith(p));
  const isClerkRoute = protectedClerkRoutes.some(p => pathname.startsWith(p));
  
  // Rule: If no session cookie exists, redirect any protected route access to login.
  if (!cookie) {
    if (isAdminRoute || isClerkRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Rule: If a session cookie exists, validate it and redirect based on role.
  try {
    const session = JSON.parse(cookie.value);
    const { role } = session;

    if (!role) {
        throw new Error("Invalid session data");
    }

    // Redirect clerks trying to access admin pages.
    if (isAdminRoute && role !== 'admin') {
       const url = request.nextUrl.clone();
       url.pathname = '/clerk'; // Redirect clerk to their own dashboard
       return NextResponse.redirect(url);
    }
    
    // Redirect non-clerks/non-admins from clerk pages.
    if (isClerkRoute && !['clerk', 'admin'].includes(role)) {
       const url = request.nextUrl.clone();
       url.pathname = '/'; // Redirect to login
       return NextResponse.redirect(url);
    }
    
  } catch (e) {
    // The cookie is invalid or malformed.
    // Redirect to login and clear the bad cookie.
    const url = request.nextUrl.clone();
    url.pathname = '/';
    const response = NextResponse.redirect(url);
    response.cookies.delete('auth-session'); 
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Matcher avoids running middleware on static files and API routes
  matcher: ['/((?!api/logout|_next/static|_next/image|favicon.ico|notification.mp3).*)'],
}
