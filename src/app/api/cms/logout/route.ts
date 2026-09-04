import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/cms/session';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
