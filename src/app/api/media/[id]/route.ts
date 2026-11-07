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
      const mime = (m[1] || row.mime || "").toLowerCase();
      const buf = Buffer.from(m[2], "base64");
      const isJpeg = buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
      const isPng = buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const isGif = buf.length >= 6 && (buf.subarray(0, 6).toString("ascii") === "GIF87a" || buf.subarray(0, 6).toString("ascii") === "GIF89a");
      const isWebp = buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
      const detectedMime = isJpeg ? "image/jpeg" : isPng ? "image/png" : isGif ? "image/gif" : isWebp ? "image/webp" : "";
      if (!detectedMime || mime !== detectedMime || buf.length > 2_000_000) {
        return NextResponse.json({ error: "Unsupported or invalid image data" }, { status: 415 });
      }
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": detectedMime,
          "Content-Length": String(buf.length),
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (/^https?:\/\//i.test(row.url)) {
      return NextResponse.redirect(row.url, 302);
    }

    return NextResponse.json({ error: "Unsupported media format" }, { status: 500 });
  } catch (e) {
    console.error("[media]", e);
    return NextResponse.json({ error: "Media service unavailable." }, { status: 503 });
  }
}
