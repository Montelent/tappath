import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

const TABLES = [
  "guides",
  "brands",
  "topics",
  "devices",
  "glossary_terms",
  "forum_topics",
  "guide_feedback",
  "profiles",
] as const;

type TableName = (typeof TABLES)[number];

async function fetchTable(table: TableName) {
  const sql = getSql()!;
  switch (table) {
    case "guides":
      return sql`SELECT * FROM guides ORDER BY created_at DESC NULLS LAST`;
    case "brands":
      return sql`SELECT * FROM brands ORDER BY sort_order ASC NULLS LAST`;
    case "topics":
      return sql`SELECT * FROM topics ORDER BY sort_order ASC NULLS LAST`;
    case "devices":
      return sql`SELECT * FROM devices ORDER BY name ASC`;
    case "glossary_terms":
      return sql`SELECT * FROM glossary_terms ORDER BY term ASC`;
    case "forum_topics":
      return sql`SELECT * FROM forum_topics ORDER BY created_at DESC NULLS LAST`;
    case "guide_feedback":
      return sql`SELECT * FROM guide_feedback ORDER BY created_at DESC NULLS LAST`;
    case "profiles":
      return sql`SELECT id, email, name, role, created_at FROM profiles ORDER BY created_at DESC NULLS LAST`;
    default:
      return [];
  }
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [keys.join(",")];
  for (const row of rows) {
    lines.push(keys.map((k) => esc(row[k])).join(","));
  }
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }

  const table = (req.nextUrl.searchParams.get("table") || "guides") as TableName;
  const format = (req.nextUrl.searchParams.get("format") || "json").toLowerCase();

  if (!TABLES.includes(table)) {
    return NextResponse.json({ error: `Unknown table. Use: ${TABLES.join(", ")}` }, { status: 400 });
  }

  try {
    const rows = (await fetchTable(table)) as Record<string, unknown>[];
    if (format === "csv") {
      const csv = toCsv(rows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="tappath-${table}.csv"`,
        },
      });
    }
    return new NextResponse(JSON.stringify(rows, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="tappath-${table}.json"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 }
    );
  }
}
