import { NextResponse } from "next/server";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isNeonConfigured();
  if (!configured) {
    return NextResponse.json({
      ok: false,
      backend: "unconfigured",
      database: false,
      message: "DATABASE_URL is not configured. Production content, authentication, and community features require Neon.",
    }, { status: 503 });
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
      message: "Neon is connected. Create an account through registration; grant admin access through a trusted database workflow.",
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      backend: "neon",
      database: true,
      connected: false,
      error: e instanceof Error ? e.message : "Query failed",
      message:
        "DATABASE_URL is set but SQL failed. Run neon/schema.sql in the Neon SQL Editor and verify the connection.",
    });
  }
}
