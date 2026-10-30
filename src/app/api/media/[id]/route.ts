import { NextRequest, NextResponse } from "next/server";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Public image proxy for screenshots in media_assets */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const sql = getSql()!;
    const rows = await sql`
      SELECT url, mime, filename FROM media_assets WHERE id::text = ${id} LIMIT 1
    `;
    const row = rows[0] as { url: string; mime: string; filename: string } | undefined;
    if (!row?.url) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Avoid /s flag (needs ES2018+); use [\s\S] instead
    const m = row.url.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (m) {
      const mime = m[1] || row.mime || "image/jpeg";
      const buf = Buffer.from(m[2], "base64");
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": mime,
          "Content-Length": String(buf.length),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (/^https?:\/\//i.test(row.url)) {
      return NextResponse.redirect(row.url, 302);
    }

    return NextResponse.json({ error: "Unsupported media format" }, { status: 500 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Media error" },
      { status: 500 }
    );
  }
}
