import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStore, saveStore } from "@/lib/store";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export async function POST(req: NextRequest) {
  let body: { guideSlug?: string; correct?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const guideSlug = (body.guideSlug || "").trim();
  if (!guideSlug || typeof body.correct !== "boolean") {
    return NextResponse.json({ error: "guideSlug and correct are required." }, { status: 400 });
  }

  const session = await getSession();

  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      try {
        await sql`
          INSERT INTO guide_feedback (guide_slug, user_id, correct)
          VALUES (${guideSlug}, ${session?.sub ?? null}, ${body.correct})
        `;
      } catch {
        await sql`
          INSERT INTO guide_feedback (guide_slug, correct)
          VALUES (${guideSlug}, ${body.correct})
        `;
      }
      const counts = await sql`
        SELECT
          count(*) FILTER (WHERE correct)::int AS yes,
          count(*) FILTER (WHERE NOT correct)::int AS no,
          count(*)::int AS total
        FROM guide_feedback
        WHERE guide_slug = ${guideSlug}
      `;
      const c = counts[0] as { yes: number; no: number; total: number };
      return NextResponse.json({ ok: true, yes: c.yes, no: c.no, total: c.total });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Feedback save failed" },
        { status: 500 }
      );
    }
  }

  saveStore((db) => {
    db.feedback.push({
      id: `f-${Date.now()}`,
      guideSlug,
      userId: session?.sub,
      correct: body.correct!,
      createdAt: new Date().toISOString(),
    });
  });

  const forGuide = getStore().feedback.filter((f) => f.guideSlug === guideSlug);
  const yes = forGuide.filter((f) => f.correct).length;
  const no = forGuide.filter((f) => !f.correct).length;

  return NextResponse.json({ ok: true, yes, no, total: forGuide.length });
}

export async function GET(req: NextRequest) {
  const guideSlug = req.nextUrl.searchParams.get("guideSlug");

  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = guideSlug
        ? await sql`SELECT * FROM guide_feedback WHERE guide_slug = ${guideSlug} ORDER BY created_at DESC`
        : await sql`SELECT * FROM guide_feedback ORDER BY created_at DESC LIMIT 500`;
      return NextResponse.json({ feedback: rows });
    } catch {
      /* fall through */
    }
  }

  const feedback = getStore().feedback;
  const filtered = guideSlug ? feedback.filter((f) => f.guideSlug === guideSlug) : feedback;
  return NextResponse.json({ feedback: filtered });
}
