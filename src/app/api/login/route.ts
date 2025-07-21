
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByUsername } from '@/lib/db';
import { User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Usuário e senha são obrigatórios' }, { status: 400 });
    }

    const user: User | null = await getUserByUsername(username);
    
    // In a real app, you would hash and compare passwords. For this prototype, we compare directly.
    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, message: 'Credenciais inválidas' }, { status: 401 });
    }

    const sessionData = { 
        userId: user.id,
        name: user.name,
        role: user.role, 
        counterId: user.counter_id, // counter_id can be null/undefined for admin
    };
    
    cookies().set('auth-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'lax',
    });
    
    return NextResponse.json({ success: true, role: user.role, session: sessionData });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}
