
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('auth-session');
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/', '/display', '/api/logout'];

  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/login')) {
    return NextResponse.next();
  }

  if (!cookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const session = JSON.parse(cookie.value);
    const { role } = session;

    if (pathname.startsWith('/admin') && role !== 'admin') {
      // If not admin, redirect to login page
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/clerk') && !['clerk', 'admin'].includes(role)) {
       // If not clerk or admin, redirect to login
       return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.next();

  } catch (err) {
    // Invalid cookie, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - notification.mp3 (sound file)
     */
    '/((?!_next/static|_next/image|favicon.ico|notification.mp3).*)',
  ],
}
