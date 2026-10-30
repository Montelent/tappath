import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

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

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  if (!isNeonConfigured()) {
    return NextResponse.json({ backend: "mock", rows: [] });
  }
  const sql = getSql()!;
  try {
    await ensureMediaTable();
    const rows = await sql`
      SELECT id, url, filename, mime, alt, size_bytes, created_at::text
      FROM media_assets ORDER BY created_at DESC LIMIT 500
    `;
    return NextResponse.json({ backend: "neon", rows });
  } catch (e) {
    return NextResponse.json({
      backend: "neon",
      rows: [],
      error: e instanceof Error ? e.message : "Query failed",
    });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }

  let body: { url?: string; filename?: string; mime?: string; alt?: string; size_bytes?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = (body.url || "").trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Valid http(s) url required" }, { status: 400 });
  }

  const sql = getSql()!;
  try {
    await ensureMediaTable();
    const rows = await sql`
      INSERT INTO media_assets (url, filename, mime, alt, size_bytes)
      VALUES (
        ${url},
        ${String(body.filename || url.split("/").pop() || "asset")},
        ${String(body.mime || "")},
        ${String(body.alt || "")},
        ${body.size_bytes != null ? Number(body.size_bytes) : null}
      )
      RETURNING id, url, filename, mime, alt, size_bytes, created_at::text
    `;
    return NextResponse.json({ row: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Insert failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const sql = getSql()!;
  try {
    await sql`DELETE FROM media_assets WHERE id::text = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}
