"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";

type FeedbackRow = {
  id: string;
  guide_slug: string;
  user_id?: string | null;
  correct: boolean;
  created_at?: string;
};

export default function FeedbackInbox() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDb, setUsingDb] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/content/guide_feedback", { credentials: "include" });
      const data = await res.json();
      if (!res.ok && data.error && !data.rows) {
        setError(data.error);
        setUsingDb(false);
      } else {
        setRows((data.rows || []) as FeedbackRow[]);
        setUsingDb(!!data.usingSupabase);
        if (data.error) setError(data.error);
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

  const remove = async (id: string) => {
    if (!confirm("Delete this feedback entry?")) return;
    const res = await fetch(`/api/admin/content/guide_feedback?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) await load();
    else {
      const data = await res.json();
      setMessage(data.error || "Delete failed");
    }
  };

  const byGuide = rows.reduce<Record<string, { yes: number; no: number }>>((acc, r) => {
    const k = r.guide_slug || "unknown";
    if (!acc[k]) acc[k] = { yes: 0, no: 0 };
    if (r.correct) acc[k].yes++;
    else acc[k].no++;
    return acc;
  }, {});

  const problemGuides = Object.entries(byGuide)
    .map(([slug, v]) => ({ slug, ...v, total: v.yes + v.no, rate: v.yes / (v.yes + v.no || 1) }))
    .filter((g) => g.total >= 1 && g.rate < 0.5)
    .sort((a, b) => a.rate - b.rate);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback inbox</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            “Was this guide helpful?” votes from the public site.{" "}
            {usingDb ? (
              <span className="text-emerald-600">Neon connected</span>
            ) : (
              <span className="text-amber-600">DATABASE_URL missing</span>
            )}
          </p>
        </div>
        <button type="button" onClick={() => load()} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}
      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{error}</p>
      )}

      {problemGuides.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Guides needing attention (&lt;50% positive)
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {problemGuides.map((g) => (
              <li key={g.slug} className="flex justify-between gap-2">
                <code className="text-xs">{g.slug}</code>
                <span>
                  {g.yes} yes / {g.no} no
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
              <tr>
                <th className="px-3 py-2.5">Guide</th>
                <th className="px-3 py-2.5">Vote</th>
                <th className="px-3 py-2.5">When</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--muted)]/30">
                  <td className="px-3 py-2.5 font-mono text-xs">{r.guide_slug}</td>
                  <td className="px-3 py-2.5">
                    {r.correct ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <ThumbsUp className="h-3.5 w-3.5" /> Helpful
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <ThumbsDown className="h-3.5 w-3.5" /> Not helpful
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[var(--muted-foreground)]">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button type="button" onClick={() => remove(r.id)} className="text-red-600" disabled={!usingDb}>
                      <Trash2 className="inline h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-[var(--muted-foreground)]">
                    No feedback yet. Votes appear when users rate guides on the public site.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
