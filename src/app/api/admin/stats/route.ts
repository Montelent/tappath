import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getStore } from "@/lib/store";
import { guides } from "@/data/guides";
import { topics } from "@/data/topics";
import { getAllDevices } from "@/data/devices";
import { glossaryTerms } from "@/data/glossary";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin required." }, { status: 403 });
  }

  const store = getStore();

  return NextResponse.json({
    content: {
      guides: Object.keys(guides).length,
      topics: topics.length,
      devices: getAllDevices().length,
      glossaryTerms: glossaryTerms.length,
      brands: 8,
    },
    community: {
      users: store.users.length,
      forumTopics: store.topics.length,
      forumReplies: store.replies.length,
      feedback: store.feedback.length,
    },
    recentFeedback: store.feedback.slice(-20).reverse(),
    recentTopics: store.topics.slice(0, 10),
  });
}
