import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const revalidate = 30;

/** Public, cacheable redirect map for middleware */
export async function GET() {
  try {
    const s = await getSiteSettings();
    const redirects = (s.seo_redirects || [])
      .filter((r) => r && r.enabled !== false && r.from && r.to && r.from.replace(/\/+$/, "") !== r.to.replace(/\/+$/, ""))
      .map((r) => ({
        from: r.from.startsWith("/") ? r.from : `/${r.from}`,
        to: r.to,
        code: r.code === 302 ? 302 : 301,
      }));
    return NextResponse.json(
      { redirects },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch {
    return NextResponse.json({ redirects: [] });
  }
}
