import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const protectedPaths = [
    '/profile',
    '/friends',
    '/posts',
    '/dashboard'
  ];

  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    const session = await fetch(`${request.nextUrl.origin}/social_network/api/check_session/`, {
      headers: { Cookie: request.headers.get('Cookie') || '' }
    });

    if (!session.ok) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}