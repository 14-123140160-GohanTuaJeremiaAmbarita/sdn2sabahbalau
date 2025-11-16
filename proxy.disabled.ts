import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🔹 Proteksi halaman admin agar hanya bisa diakses setelah login
export function proxy(request: NextRequest) {
  const cookie = request.cookies.get('sb_admin');

  // Jika belum login dan coba akses halaman admin, arahkan ke login
  if (!cookie && request.nextUrl.pathname.startsWith('/admin')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 🔹 Tentukan rute mana saja yang dilindungi
export const config = {
  matcher: ['/admin/:path*'],
};