
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByUsername } from '@/lib/db';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ success: false, message: 'Usuário e senha são obrigatórios' }, { status: 400 });
  }

  const user = await getUserByUsername(username);

  if (!user || user.password !== password) {
    return NextResponse.json({ success: false, message: 'Credenciais inválidas' }, { status: 401 });
  }

  const sessionData = { 
      userId: user.id,
      name: user.name,
      role: user.role, 
      counterId: user.counter_id,
  };
  
  cookies().set('auth-session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
  
  return NextResponse.json({ success: true, role: user.role });
}
