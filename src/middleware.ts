import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        console.log('token', token);
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname === '/login' ||
            req.nextUrl.pathname === '/';

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            return null;
        }

        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }

            return NextResponse.redirect(
                new URL(`/?from=${encodeURIComponent(from)}`, req.url)
            );
        }

        // Handle role-based access
        if (req.nextUrl.pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    },
    {
        callbacks: {
            authorized: () => true, // Let the middleware function handle the auth check
        },
    }
);

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/login',
        '/((?!api|_next/static|_next/image|favicon.ico|public|/).*)',
    ],
}; 