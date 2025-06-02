import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');
  const isCheckoutPage = request.nextUrl.pathname.includes('/checkout');

  if (isCheckoutPage && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/products/:path*/checkout']
}; 