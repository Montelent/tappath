import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge redirects:
 * - Strip trailing slashes (except /)
 * - Optional host force via SEO_FORCE_HOST + NEXT_PUBLIC_SITE_URL
 * - Manual admin redirects via cached /api/seo/redirect-map
 */
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    url.pathname = pathname.replace(/\/+$/, "") || "/";
    return NextResponse.redirect(url, 301);
  }

  const preferred = process.env.NEXT_PUBLIC_SITE_URL || process.env.SEO_CANONICAL_HOST || "";
  if (preferred && process.env.SEO_FORCE_HOST === "true") {
    try {
      const preferredUrl = new URL(preferred);
      if (req.nextUrl.host !== preferredUrl.host) {
        const dest = new URL(pathname + req.nextUrl.search, preferredUrl.origin);
        return NextResponse.redirect(dest, 301);
      }
    } catch {
      /* ignore */
    }
  }

  try {
    const mapUrl = new URL("/api/seo/redirect-map", req.nextUrl.origin);
    const res = await fetch(mapUrl.toString(), {
      headers: { "x-middleware-redirect-check": "1" },
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        redirects?: { from: string; to: string; code?: number }[];
      };
      const hit = (data.redirects || []).find((r) => {
        const from = r.from.startsWith("/") ? r.from : `/${r.from}`;
        return from === pathname;
      });
      if (hit && hit.to !== pathname) {
        const code = hit.code === 302 ? 302 : 301;
        if (hit.to.startsWith("http")) {
          return NextResponse.redirect(hit.to, code);
        }
        url.pathname = hit.to.startsWith("/") ? hit.to : `/${hit.to}`;
        return NextResponse.redirect(url, code);
      }
    }
  } catch {
    /* no map */
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
