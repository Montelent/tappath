import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStore, saveStore } from "@/lib/store";

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
  const feedback = getStore().feedback;
  const filtered = guideSlug ? feedback.filter((f) => f.guideSlug === guideSlug) : feedback;
  const yes = filtered.filter((f) => f.correct).length;
  const no = filtered.filter((f) => !f.correct).length;
  return NextResponse.json({ yes, no, total: filtered.length });
}
