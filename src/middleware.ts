
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
  
  // Se não houver cookie, redireciona para a página de login.
  if (!cookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
  }

  // Se houver um cookie, valida a sessão e as permissões.
  try {
    const session = JSON.parse(cookie.value);
    const { role } = session;

    if (!role) {
        throw new Error("Invalid session data");
    }

    // Redireciona atendentes que tentam acessar páginas de admin.
    if (isAdminRoute && role !== 'admin') {
       const url = request.nextUrl.clone();
       url.pathname = '/clerk'; // Redireciona para o painel do atendente
       return NextResponse.redirect(url);
    }
    
    // Se o usuário já está logado, permite o acesso às rotas internas.
    if (isClerkRoute && (role === 'clerk' || role === 'admin')) {
      return NextResponse.next();
    }
    if (isAdminRoute && role === 'admin') {
      return NextResponse.next();
    }
    
  } catch (e) {
    // Se o cookie for inválido, redireciona para o login e limpa o cookie.
    const url = request.nextUrl.clone();
    url.pathname = '/';
    const response = NextResponse.redirect(url);
    response.cookies.delete('auth-session'); 
    return response;
  }

  // Se nenhuma das condições acima for atendida, por segurança, redireciona para o login.
  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
}

export const config = {
  // O matcher evita que o middleware rode em arquivos estáticos, imagens, etc.
  matcher: ['/((?!api/logout|_next/static|_next/image|favicon.ico|notification.mp3).*)'],
}
