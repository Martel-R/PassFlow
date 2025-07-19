
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { role } = await request.json();

  if (role === 'admin' || role === 'clerk') {
    // In a real app, you'd verify credentials and create a session
    cookies().set('auth-session', JSON.stringify({ role, loggedInAt: Date.now() }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
}
