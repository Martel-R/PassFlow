
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('auth-session');
  const { pathname } = request.nextUrl;

  const isPublicRoute = ['/', '/get-ticket', '/display'].includes(pathname) || pathname.startsWith('/api/login');
  const isAdminRoute = pathname.startsWith('/admin');
  const isClerkRoute = pathname.startsWith('/clerk');

  // If no session cookie exists
  if (!cookie) {
    // Allow access to public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }
    // For any other protected route, redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/';
    return NextResponse.redirect(loginUrl);
  }

  // If a session cookie exists, try to parse it
  try {
    const session = JSON.parse(cookie.value);
    const { role } = session;

    if (!role) {
      throw new Error("Invalid session: role is missing");
    }

    // If user is logged in and tries to access the login page, redirect them to their dashboard
    if (pathname === '/') {
       const dashboardUrl = request.nextUrl.clone();
       dashboardUrl.pathname = role === 'admin' ? '/admin' : '/clerk';
       return NextResponse.redirect(dashboardUrl);
    }
    
    // If an admin tries to access a clerk-only route, it's fine (admins can do everything)
    // If a clerk tries to access an admin route, redirect them
    if (isAdminRoute && role !== 'admin') {
      const clerkUrl = request.nextUrl.clone();
      clerkUrl.pathname = '/clerk';
      return NextResponse.redirect(clerkUrl);
    }

    // If all checks pass, allow the request to proceed
    return NextResponse.next();

  } catch (e) {
    // If the cookie is invalid, delete it and redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/';
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-session');
    return response;
  }
}

export const config = {
  // The matcher prevents the middleware from running on static files, images, etc.
  matcher: ['/((?!api/logout|_next/static|_next/image|favicon.ico|notification.mp3).*)'],
}
