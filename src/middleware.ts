import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/settings';

// Define public pages that don't require authentication
const publicPages = ['/', '/login', '/register/new-tenant', '/es/register/new-tenant', '/en/register/new-tenant'];

// Create internationalization middleware
const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'as-needed'
});

// Auth middleware with next-auth
const authMiddleware = withAuth(
    // This callback is invoked after successful authentication
    function onSuccess(req) {
        return handleI18nRouting(req);
    },
    {
        callbacks: {
            authorized: async ({ token, req }) => {
                // Basic authorization check
                if (!token) return false;

                // Admin route protection
                const pathname = req.nextUrl.pathname;
                const pathnameWithoutLocale = pathname.replace(/^\/(?:es|en)(?=$|\/)/i, '');

                if (pathnameWithoutLocale.startsWith('/admin') && token.role !== 'ADMIN') {
                    // Redirect non-admin users trying to access admin routes
                    const locale = pathname.match(/^\/(es|en)(?=$|\/)/)?.[1] || defaultLocale;
                    // Create redirect response, but return false to let withAuth handle the redirect
                    NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
                    return false;
                }

                return true;
            }
        },
        pages: {
            signIn: '/login'
        }
    }
);

export default function middleware(req: NextRequest) {
    // Create regex to match public pages, accounting for locales
    const publicPathnameRegex = RegExp(
        `^(/(${locales.join('|')}))?(${publicPages
            .flatMap((p) => (p === '/' ? ['', '/'] : p))
            .join('|')})/?$`,
        'i'
    );

    // Check for public routes that don't need auth
    const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

    // Check for API routes or other special paths
    const publicPatterns = [/^\/(es|en)?\/api\//, /^\/(es|en)?\/public\//];
    const isSpecialPublicRoute = publicPatterns.some(pattern => pattern.test(req.nextUrl.pathname));

    // For public or special routes, only apply i18n middleware
    if (isPublicPage || isSpecialPublicRoute) {
        return handleI18nRouting(req);
    } else {
        // For protected routes, apply auth middleware with type assertion
        // This is necessary because the withAuth typing expects 2 arguments
        return (authMiddleware as any)(req);
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)', '/dashboard/:path*', '/admin/:path*', '/login']
}; 