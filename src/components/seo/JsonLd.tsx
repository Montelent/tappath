/** Safe JSON-LD script tag for structured data. */
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Canonical site origin for absolute URLs in schema.
 * Prefers Vercel deployment host so preview deploys match the crawled page.
 * Never hardcodes a production domain.
 */
export function siteBase(): string {
  const vercel = (process.env.VERCEL_URL || "").trim().replace(/\/$/, "");
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }
  const explicit = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (explicit) return explicit;
  return "";
}

/** Server Components: resolve origin from the incoming request host when possible. */
export async function requestOrigin(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") || "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    /* not in a request context */
  }
  return siteBase();
}

export function originFromPageUrl(pageUrl: string): string {
  try {
    return new URL(pageUrl).origin;
  } catch {
    return siteBase();
  }
}

/** Make media / path URLs absolute on the same origin as the page. */
export function absOnOrigin(
  href: string | undefined | null,
  origin: string
): string | undefined {
  if (href == null) return undefined;
  const t = String(href).trim();
  if (!t || t === "null" || t === "undefined") return undefined;
  if (t.startsWith("/")) return `${origin}${t}`;
  try {
    const u = new URL(t);
    if (u.pathname.startsWith("/api/media/") || u.pathname.startsWith("/uploads/")) {
      return `${origin}${u.pathname}${u.search}`;
    }
    return t;
  } catch {
    return t.startsWith("http") ? t : `${origin}/${t.replace(/^\//, "")}`;
  }
}
