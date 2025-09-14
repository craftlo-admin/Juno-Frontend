import { NextRequest, NextResponse } from 'next/server';

function getTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for these paths
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/.well-known/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const protectedRoutes = ['/dashboard', '/workspace'];
  const authRoutes = ['/login', '/register', '/verify-email'];
  const publicRoutes = ['/', '/about', '/contact']; // Add your public routes

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname) || pathname === '/';

  const token = getTokenFromRequest(request);

  // Allow public routes without token
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protect authenticated routes
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/workspace', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)',
  ],
};