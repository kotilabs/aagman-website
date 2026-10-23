/**
 * Vercel Routing Middleware for www.aagman.ai. Two separate jobs, by path:
 *
 *  1. The pages forwarded to the app server: two request headers (below). Unchanged by phase 3.
 *  2. Since phase 3, the marketing pages: the aag_click cookie in the page's own Set-Cookie
 *     (docs/analytics.md section 15). Safari keeps a cookie set this way for 90 days; one
 *     written by analytics.js is capped at 7 days (or 1 day after a click from a tracker).
 *
 * 1. Forwarded pages.
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
// The page script's own cookie code, so the server writes exactly phase 2's format and rules.
// analytics.js exports its pure helpers when loaded as a module (and runs nothing else).
import analytics from './analytics.js';

export const EDGE_SECRET_HEADER = 'x-aagman-edge-secret';
export const VISITOR_IP_HEADER = 'x-aagman-visitor-ip';

/** Phase 3: every marketing page, i.e. every path whose last segment has no dot (no files or assets), except /_next. */
export const MARKETING_MATCHER = '/:path((?!_next(?:/|$))[^.]*)';

/**
 * Same list, in the same order, as the rewrite sources in vercel.json minus /_next/:path*
 * (the tests check this), then MARKETING_MATCHER. Vercel reads `config` statically, so it
 * must stay a literal here.
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
    // Phase 3: the marketing pages (= MARKETING_MATCHER). The extensionless forwarded paths match
    // it too; they were already matched above and still take the forwarding path, unchanged.
    '/:path((?!_next(?:/|$))[^.]*)',
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
  if (!isForwardedPath(new URL(request.url).pathname)) return marketingPage(request);

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

// ---------------------------------------------------------------------------
// 2. Marketing pages (phase 3, docs/analytics.md section 15)
// ---------------------------------------------------------------------------
// On every GET of a marketing page the response carries aag_click: the cookie on the request,
// updated with this visit by analytics.js's own updateClick (first touch never overwritten, the
// latest tagged touch replaced, size capped), re-dated to 90 days. A visit without tags re-sends
// the same value, so the 90 days run from the last visit and a cookie the page script wrote as a
// fallback becomes a server cookie. Not HttpOnly: the app's login page reads it. The request
// itself goes on untouched. Anything that goes wrong means no cookie, never a failed page.

interface ClickHelpers {
  CONFIG: { clickCookie: string; clickDays: number };
  normalizePath(pathname: string): string;
  touchFromUrl(search: string, referrer: string, landingPath: string, now: Date, pageHost: string): object;
  updateClick(existing: unknown, touch: object): object;
  serializeClick(click: object): string;
  parseClick(raw: string | null): unknown;
}
const A = analytics as unknown as ClickHelpers;

export const CLICK_COOKIE = A.CONFIG.clickCookie; // 'aag_click'
const CLICK_MAX_AGE = Math.round(A.CONFIG.clickDays * 86400); // 90 days, in seconds

/** A page of the marketing site: not forwarded, not /_next, no dot in the last segment. */
export function isMarketingPage(pathname: string): boolean {
  if (isForwardedPath(pathname) || /^\/_next(\/|$)/.test(pathname)) return false;
  return !pathname.slice(pathname.lastIndexOf('/') + 1).includes('.');
}

/** The raw value of the first cookie called `name` in a Cookie header (as the page script reads it), or null. */
export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const pair = part.trim();
    const eq = pair.indexOf('=');
    if (eq > 0 && pair.slice(0, eq) === name) return pair.slice(eq + 1);
  }
  return null;
}

/** The Set-Cookie header for this request, or null (not a GET of a marketing page, or anything failed). */
export function clickSetCookie(request: Request, now: Date = new Date()): string | null {
  try {
    if (request.method !== 'GET') return null;
    const url = new URL(request.url);
    if (!isMarketingPage(url.pathname)) return null;
    const existing = A.parseClick(readCookie(request.headers.get('cookie'), CLICK_COOKIE));
    const touch = A.touchFromUrl(url.search, request.headers.get('referer') ?? '', A.normalizePath(url.pathname), now, url.hostname);
    const value = A.serializeClick(A.updateClick(existing, touch));
    // Same attributes as analytics.js's writeCookie, so both write the one cookie (a preview host gets a host-only one).
    const domain = /(^|\.)aagman\.ai$/.test(url.hostname) ? '; Domain=.aagman.ai' : '';
    const secure = url.protocol === 'https:' ? '; Secure' : '';
    return `${CLICK_COOKIE}=${value}; Max-Age=${CLICK_MAX_AGE}; Path=/${domain}; SameSite=Lax${secure}`;
  } catch {
    return null;
  }
}

function marketingPage(request: Request): Response {
  const cookie = clickSetCookie(request);
  return cookie ? next({ headers: { 'set-cookie': cookie } }) : next();
}
