import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const store = getStore();
  const topic = store.topics.find((t) => t.id === id);
  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  saveStore((db) => {
    const t = db.topics.find((x) => x.id === id);
    if (t) t.views += 1;
  });

  const replies = store.replies
    .filter((r) => r.topicId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return NextResponse.json({
    topic: { ...topic, views: topic.views + 1 },
    replies,
  });
}
