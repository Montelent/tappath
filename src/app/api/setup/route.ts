import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

/**
 * Protected database setup check.
 * Bundled demo/editorial content is deliberately never inserted into production.
 * Create and publish live content through the Admin area.
 */
export async function POST(req: NextRequest) {
  const supplied = req.headers.get("x-setup-secret") || "";
  const expected = process.env.SETUP_SECRET || "";
  if (
    expected.length < 32 ||
    Buffer.byteLength(supplied) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set on Vercel." }, { status: 503 });
  }

  try {
    const sql = getSql()!;
    const [profiles, guides, brands, topics, devices, glossary] = await Promise.all([
      sql`SELECT count(*)::int AS count FROM profiles`,
      sql`SELECT count(*)::int AS count FROM guides`,
      sql`SELECT count(*)::int AS count FROM brands`,
      sql`SELECT count(*)::int AS count FROM topics`,
      sql`SELECT count(*)::int AS count FROM devices`,
      sql`SELECT count(*)::int AS count FROM glossary_terms`,
    ]);
    const counts = {
      profiles: Number((profiles[0] as { count: number }).count),
      guides: Number((guides[0] as { count: number }).count),
      brands: Number((brands[0] as { count: number }).count),
      topics: Number((topics[0] as { count: number }).count),
      devices: Number((devices[0] as { count: number }).count),
      glossary: Number((glossary[0] as { count: number }).count),
    };

    return NextResponse.json({
      ok: true,
      backend: "neon",
      counts,
      seeded: false,
      message: "Database connection checked. No bundled demo content was inserted; manage live content in Admin.",
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : "Database setup check failed",
      hint: "Run neon/schema.sql in the Neon SQL Editor first.",
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Protected database check. Configure SETUP_SECRET and send it in x-setup-secret.",
    url: "/api/setup",
  });
}
