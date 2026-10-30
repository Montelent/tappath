import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 1_500_000;

async function ensureMediaTable() {
  const sql = getSql()!;
  await sql`
    CREATE TABLE IF NOT EXISTS media_assets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      url text NOT NULL,
      filename text NOT NULL DEFAULT '',
      mime text NOT NULL DEFAULT '',
      alt text NOT NULL DEFAULT '',
      size_bytes int,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file field required" }, { status: 400 });
  }

  const blob = file as File;
  const mime = blob.type || "image/jpeg";
  if (!mime.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (blob.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Image too large (max ${Math.round(MAX_BYTES / 1000)} KB). Compress the screenshot.` },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await blob.arrayBuffer());
  const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
  const filename = blob.name || `screenshot-${Date.now()}.jpg`;

  const sql = getSql()!;
  try {
    await ensureMediaTable();
    const rows = await sql`
      INSERT INTO media_assets (url, filename, mime, alt, size_bytes)
      VALUES (
        ${dataUrl},
        ${filename},
        ${mime},
        ${String(form.get("alt") || "")},
        ${buf.length}
      )
      RETURNING id, filename, mime, size_bytes, created_at::text
    `;
    const row = rows[0] as { id: string; filename: string; mime: string; size_bytes: number };
    return NextResponse.json({
      ok: true,
      id: row.id,
      url: dataUrl,
      filename: row.filename,
      mime: row.mime,
      size_bytes: row.size_bytes,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
