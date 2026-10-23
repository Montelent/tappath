import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getStore, saveStore } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const store = getStore();
  if (!store.topics.find((t) => t.id === id)) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.body || "").trim();
  if (!text) {
    return NextResponse.json({ error: "Reply body required." }, { status: 400 });
  }

  const reply = {
    id: `r-${Date.now()}`,
    topicId: id,
    authorId: user.id,
    authorName: user.name,
    body: text,
    createdAt: new Date().toISOString(),
  };

  saveStore((db) => {
    db.replies.push(reply);
    const t = db.topics.find((x) => x.id === id);
    if (t) t.updatedAt = reply.createdAt;
  });

  return NextResponse.json({ reply }, { status: 201 });
}
