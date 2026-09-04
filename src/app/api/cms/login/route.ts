import { NextResponse } from 'next/server';
import { isAdminAuthConfigured } from '@/lib/env';
import { ADMIN_SESSION_COOKIE, createSessionToken, verifyPassword } from '@/lib/cms/session';

const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

export async function POST(request: Request): Promise<NextResponse> {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { message: "Sign-in isn't set up yet. Please contact your website developer." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Could not read the submitted data.' }, { status: 400 });
  }

  const password = typeof body === 'object' && body !== null && 'password' in body ? (body as { password: unknown }).password : undefined;

  if (typeof password !== 'string' || !verifyPassword(password)) {
    return NextResponse.json({ message: 'Incorrect password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
