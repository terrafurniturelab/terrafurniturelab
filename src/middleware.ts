import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isAdminLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAdminRootPage = request.nextUrl.pathname === '/admin';

  // Check for admin token in cookies
  const adminToken = request.cookies.get('adminToken');

  // Handle admin routes
  if (isAdminPage) {
    // If accessing admin login page and has admin token, redirect to dashboard
    if (isAdminLoginPage && adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // If accessing any admin page without admin token, redirect to login
    if (!adminToken && !isAdminLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // If accessing /admin root, redirect to dashboard if has token
    if (isAdminRootPage && adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Handle user routes
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isRegisterPage = request.nextUrl.pathname === '/register';
  const isCheckoutPage = request.nextUrl.pathname.startsWith('/products/') && request.nextUrl.pathname.endsWith('/checkout');
  const isProfilePage = request.nextUrl.pathname === '/profile';
  const isCartPage = request.nextUrl.pathname === '/cart';
  const isOrdersPage = request.nextUrl.pathname === '/orders';
  const isFeedbackPage = request.nextUrl.pathname === '/feedback';

  // If user is not logged in and trying to access protected pages
  if (!token && (isProfilePage || isCartPage || isOrdersPage || isCheckoutPage || isFeedbackPage)) {
    return new NextResponse(null, { status: 404 });
  }

  // If user is logged in and trying to access auth pages
  if (token && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/cart',
    '/orders',
    '/profile',
    '/feedback',
    '/products/:path*/checkout',
    '/admin/:path*'
  ],
}; 