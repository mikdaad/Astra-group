import { type NextRequest, NextResponse } from 'next/server';

const REF_COOKIE = 'referral_code';
const DAYS_30 = 60 * 60 * 24 * 30;

export async function middleware(req: NextRequest) {
  // Use a clone of the URL to safely modify it
  const url = req.nextUrl.clone();
  const ref = url.searchParams.get('ref');
  const { pathname } = req.nextUrl;

  // Block unnecessary routes for gold and diamonds investment program
  const blockedRoutes = [
    '/promoters',
    '/commision',
    '/installments',
    '/transfers',
    '/cards',
    '/viewall',
    '/test-cards',
    '/winnerview',
    '/brochure',
    '/admin/referrals',
    '/dashboard',
    '/wallet'
  ];

  // Check if current path should be blocked
  const shouldBlock = blockedRoutes.some(route => pathname.startsWith(route));
  if (shouldBlock) {
    // Redirect to homepage for blocked routes
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 1. Check for the referral code first
  if (ref) {
    // Clean the URL by removing the 'ref' parameter
    url.searchParams.delete('ref');
    
    // Create a redirect response to the clean URL
    const res = NextResponse.redirect(url, { status: 302 });

    // Set the referral cookie on the response
    res.cookies.set(REF_COOKIE, ref, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax',
      path: '/',
      maxAge: DAYS_30,
    });

    // Return the response to complete the redirect and stop further processing
    return res;
  }

  // Allow all routes without authentication for public access
  return NextResponse.next();
}

// Use the more comprehensive matcher from your second example
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - and other static assets, public files, and specific auth routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|admin/login|admin/signup|manifest.json|api/admin/auth|public/|auth/|api/auth/|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|json|xml|map|woff|woff2|ttf|eot)$).*)',
  ],
};