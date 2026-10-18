/**
 * Vercel Routing Middleware for the pages www.aagman.ai forwards to the app server.
 *
 * vercel.json rewrites the app's public pages (stock, fund, screener, chart, news,
 * how-we-compute, their /_next assets, the sitemap files, llms.txt and the
 * IndexNow key file) to
 * https://app.aagman.ai/<same path>. This middleware runs on those paths except
 * /_next (static assets, where the app ignores these headers),
 * before the rewrite, and sets two request headers for the app
 * (contract: deploy/docs/public-zone-edge.md and frontend/src/middleware.ts in the app repo):
 *
 *   x-aagman-edge-secret  = the PUBLIC_EDGE_SECRET env var (same value as the app's).
 *                           Proves the request came through www, so the app does not
 *                           redirect it back to www and trusts the visitor address.
 *   x-aagman-visitor-ip   = the visitor's address as Vercel saw it (x-real-ip, via
 *                           ipAddress() from @vercel/functions), so each visitor keeps
 *                           their own rate-limit bucket on the app side.
 *
 * Any copy of either header sent by the visitor is dropped first: a client can never
 * choose its address or probe the secret through www. When PUBLIC_EDGE_SECRET is unset
 * (or not a well-formed value), the request is forwarded without the secret header and
 * the app treats it as an ordinary visitor. Nothing is logged with the secret's value,
 * and no header is added to the response the visitor gets.
 *
 * Every other path on the site never reaches this file (config.matcher), and if one
 * did, it would continue untouched (isForwardedPath).
 */
import { ipAddress } from '@vercel/functions/headers';
import { next } from '@vercel/functions/middleware';

export const EDGE_SECRET_HEADER = 'x-aagman-edge-secret';
export const VISITOR_IP_HEADER = 'x-aagman-visitor-ip';

/**
 * Same list, in the same order, as the rewrite sources in vercel.json minus /_next/:path*
 * (the tests check this). Vercel reads `config` statically, so it must stay a literal here.
 */
export const config = {
  // /_next/:path* is rewritten too, but the app ignores these headers on its static
  // assets, so the middleware (a function call per request) does not run there.
  matcher: [
    '/stock',
    '/stock/:path*',
    '/fund',
    '/fund/:path*',
    '/stock-screener',
    '/stock-screener/:path*',
    '/how-we-compute',
    '/how-we-compute/:path*',
    '/chart',
    '/chart/:path*',
    '/news',
    '/news/:path*',
    '/sitemap-stocks.xml',
    '/sitemap-funds.xml',
    '/sitemap-screens.xml',
    '/sitemap-charts.xml',
    '/sitemap-news.xml',
    '/llms.txt',
    '/0ea2491ba8dc98fd3c8de4a2fb8998ca.txt',
  ],
  runtime: 'nodejs',
};

/** Whole-segment matches only: /chart and /chart/x, never /charts or /chartered. */
const FORWARDED_ROOTS = ['/stock', '/fund', '/stock-screener', '/how-we-compute', '/chart', '/news'];
const FORWARDED_FILES = [
  '/sitemap-stocks.xml',
  '/sitemap-funds.xml',
  '/sitemap-screens.xml',
  '/sitemap-charts.xml',
  '/sitemap-news.xml',
  '/llms.txt',
  '/0ea2491ba8dc98fd3c8de4a2fb8998ca.txt', // IndexNow key file
];

export function isForwardedPath(pathname: string): boolean {
  if (FORWARDED_FILES.includes(pathname)) return true;
  return FORWARDED_ROOTS.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

/** The app accepts 32+ characters of A-Z a-z 0-9 _ - (its deploy rejects anything else). */
const SECRET_FORMAT = /^[A-Za-z0-9_-]{32,}$/;
/** An IPv4 or IPv6 address: the same check the app applies to the header. */
const VISITOR_IP_FORMAT = /^[0-9a-fA-F.:]{2,45}$/;

/** The secret to send, or null when the env var is unset or malformed. */
function edgeSecret(): string | null {
  const value = (process.env.PUBLIC_EDGE_SECRET ?? '').trim();
  return SECRET_FORMAT.test(value) ? value : null;
}

let warnedMalformed = false;

export default function middleware(request: Request): Response {
  if (!isForwardedPath(new URL(request.url).pathname)) return next();

  const headers = new Headers(request.headers);
  headers.delete(EDGE_SECRET_HEADER);
  headers.delete(VISITOR_IP_HEADER);

  const secret = edgeSecret();
  if (secret) {
    headers.set(EDGE_SECRET_HEADER, secret);
  } else if (process.env.PUBLIC_EDGE_SECRET && !warnedMalformed) {
    warnedMalformed = true;
    console.error('[forwarding] error: PUBLIC_EDGE_SECRET is set but malformed; forwarding without it');
  }

  const visitor = ipAddress(request);
  if (visitor && VISITOR_IP_FORMAT.test(visitor)) headers.set(VISITOR_IP_HEADER, visitor);

  return next({ request: { headers } });
}
