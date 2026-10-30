import { NextResponse } from "next/server";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isNeonConfigured();
  if (!configured) {
    return NextResponse.json({
      ok: true,
      backend: "mock",
      database: false,
      message:
        "DATABASE_URL is NOT set on Vercel. Admin and auth use in-memory mock only. Add DATABASE_URL (Neon pooler) → Redeploy → open /admin/guides → Seed DB.",
    });
  }

  try {
    const sql = getSql()!;
    const [g] = await sql`SELECT count(*)::int AS n FROM guides`;
    const [b] = await sql`SELECT count(*)::int AS n FROM brands`;
    const [p] = await sql`SELECT count(*)::int AS n FROM profiles`;
    return NextResponse.json({
      ok: true,
      backend: "neon",
      database: true,
      counts: {
        guides: (g as { n: number }).n,
        brands: (b as { n: number }).n,
        profiles: (p as { n: number }).n,
      },
      message: "Neon is connected. Use admin@tappath.com after Seed if profiles is 0.",
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      backend: "neon",
      database: true,
      connected: false,
      error: e instanceof Error ? e.message : "Query failed",
      message:
        "DATABASE_URL is set but SQL failed. Run neon-schema.sql in Neon SQL Editor (tables missing).",
    });
  }
}
