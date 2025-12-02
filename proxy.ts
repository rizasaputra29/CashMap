// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Daftar path halaman frontend yang memerlukan login
const protectedPaths = [
  '/dashboard',
  '/transactions',
  '/savings',
  '/profile',
];

// Regex untuk mendeteksi API yang perlu dilindungi (semua kecuali auth)
const apiProtectedPaths = /^\/api\/(?!auth\/)/;

export function proxy(request: NextRequest) {
  // 1. Ambil Token Sesi dari Cookies
  // Kita menggunakan cookie 'session_token_mock' yang diset saat login
  const userId = request.cookies.get('session_token_mock')?.value;
  const pathname = request.nextUrl.pathname;

  // --- A. PROTEKSI HALAMAN FRONTEND ---
  
  // Cek apakah user mengakses halaman yang dilindungi
  const isProtectedPage = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPage && !userId) {
    // Jika tidak ada user ID di cookie, redirect ke login
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('from', pathname); // Simpan url asal untuk redirect balik nanti
    return NextResponse.redirect(url);
  }

  // REMOVED: Logic that prevents logged-in users from accessing login/register pages
  // The original code redirected to /dashboard if userId existed and path started with /auth/login or /auth/register.
  // This section is intentionally removed to allow access.

  // --- B. PROTEKSI API ROUTE ---

  if (apiProtectedPaths.test(pathname)) {
    if (!userId) {
      // Jika akses API tanpa token, tolak dengan 401
      return NextResponse.json(
        { message: 'Unauthorized: Missing session token' }, 
        { status: 401 }
      );
    }

    // PENTING: Teruskan User ID ke Backend (API Routes) via Header
    // Ini memastikan API Route kita tidak perlu parsing cookie lagi, cukup baca header ini.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Lanjutkan request jika tidak ada aturan yang dilanggar
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Matcher ini memastikan proxy berjalan di semua path kecuali static files
    '/((?!_next/static|_next/image|favicon.ico|sw.js|workbox.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/:path*',
  ],
};