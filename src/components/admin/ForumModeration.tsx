"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Circle,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

type Topic = {
  id: string;
  title: string;
  brand: string;
  brand_slug: string;
  category: string;
  author_name: string;
  excerpt: string;
  body: string;
  solved: boolean;
  views: number;
  created_at?: string;
  updated_at?: string;
};

type Reply = {
  id: string;
  topic_id: string;
  author_name: string;
  body: string;
  created_at?: string;
};

export default function ForumModeration() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDb, setUsingDb] = useState(false);
  const [message, setMessage] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tRes, rRes] = await Promise.all([
        fetch("/api/admin/content/forum_topics", { credentials: "include" }),
        fetch("/api/admin/content/forum_replies", { credentials: "include" }),
      ]);
      const tData = await tRes.json();
      const rData = await rRes.json();
      if (!tRes.ok && tData.error && !tData.rows) {
        setError(tData.error);
        setUsingDb(false);
      } else {
        setTopics((tData.rows || []) as Topic[]);
        setReplies((rData.rows || []) as Reply[]);
        setUsingDb(!!tData.usingSupabase);
        if (tData.error) setError(tData.error);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSolved = async (topic: Topic) => {
    setBusy(topic.id);
    setMessage("");
    try {
      const res = await fetch("/api/admin/content/forum_topics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...topic, solved: !topic.solved }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Update failed");
      else {
        setMessage(topic.solved ? "Marked unsolved" : "Marked solved");
        await load();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setBusy(null);
    }
  };

  const deleteTopic = async (id: string) => {
    if (!confirm("Delete this topic and all replies?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/content/forum_topics?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) await load();
      else {
        const data = await res.json();
        setMessage(data.error || "Delete failed");
      }
    } finally {
      setBusy(null);
    }
  };

  const deleteReply = async (id: string) => {
    if (!confirm("Delete this reply?")) return;
    const res = await fetch(`/api/admin/content/forum_replies?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) await load();
    else {
      const data = await res.json();
      setMessage(data.error || "Delete failed");
    }
  };

  const topicReplies = (topicId: string) =>
    replies.filter((r) => r.topic_id === topicId || String(r.topic_id) === String(topicId));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forum moderation</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {usingDb ? (
              <span className="text-emerald-600">Neon connected</span>
            ) : (
              <span className="text-amber-600">DATABASE_URL missing</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => load()} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <Link href="/community" target="_blank" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
            <ExternalLink className="h-3.5 w-3.5" /> View forum
          </Link>
        </div>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}
      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((t) => {
            const rs = topicReplies(t.id);
            const open = openId === t.id;
            return (
              <div key={t.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <button
                    type="button"
                    disabled={busy === t.id || !usingDb}
                    onClick={() => toggleSolved(t)}
                    className="mt-0.5 shrink-0"
                    title={t.solved ? "Mark unsolved" : "Mark solved"}
                  >
                    {t.solved ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-[var(--muted-foreground)]" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{t.title}</h2>
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] uppercase">{t.brand}</span>
                      {t.solved && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Solved</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {t.author_name} · {rs.length} replies · {t.views ?? 0} views
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">{t.excerpt || t.body}</p>
                    {open && (
                      <div className="mt-3 space-y-2 border-t border-[var(--border)] pt-3">
                        <p className="whitespace-pre-wrap text-sm">{t.body}</p>
                        <h3 className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Replies</h3>
                        {rs.length === 0 && <p className="text-sm text-[var(--muted-foreground)]">No replies</p>}
                        {rs.map((r) => (
                          <div key={r.id} className="flex gap-2 rounded-xl bg-[var(--muted)]/40 px-3 py-2 text-sm">
                            <div className="flex-1">
                              <span className="font-medium">{r.author_name}</span>
                              <p className="mt-0.5 whitespace-pre-wrap">{r.body}</p>
                            </div>
                            <button type="button" onClick={() => deleteReply(r.id)} className="text-red-500" title="Delete reply">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => setOpenId(open ? null : t.id)} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {open ? "Hide" : "Open"}
                    </button>
                    <button type="button" onClick={() => deleteTopic(t.id)} disabled={!usingDb} className="rounded-full border border-red-200 px-2.5 py-1 text-xs text-red-600 dark:border-red-900">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {topics.length === 0 && (
            <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">
              No forum topics yet. Users post from the community page.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
