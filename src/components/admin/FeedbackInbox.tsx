"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import {
  AdminLoading,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
  AdminSecondaryButton,
  AdminTable,
  wp,
} from "./AdminUI";

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
        setUsingDb(!!data.usingSupabase || !!data.usingDb);
        if (data.error) setError(data.error);
      }
    } catch {
      setError("Network error — try Refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string) => {
    if (!confirm("Delete this feedback entry? This cannot be undone.")) return;
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
    <div className={wp.page}>
      <AdminPageHeader
        title="Feedback Inbox"
        description={
          <>
            Votes from the “Was this guide helpful?” box on public guides. Use this to find guides
            that need fixing.{" "}
            {usingDb ? (
              <span className="text-[#00a32a]">Database connected</span>
            ) : (
              <span className="text-[#dba617]">Database not connected</span>
            )}
          </>
        }
        actions={
          <AdminSecondaryButton onClick={() => load()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </AdminSecondaryButton>
        }
      />

      {message && <AdminNotice tone="info">{message}</AdminNotice>}
      {error && <AdminNotice tone="warn">{error}</AdminNotice>}

      {problemGuides.length > 0 && (
        <AdminPanel
          title="Guides that need attention"
          description="These guides have more “No” votes than “Yes”. Open them and improve the steps."
        >
          <ul className="space-y-2 text-[13px]">
            {problemGuides.map((g) => (
              <li key={g.slug} className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0f0f1] pb-2 last:border-0">
                <code className="rounded bg-[#f6f7f7] px-1.5 py-0.5 text-[12px]">{g.slug}</code>
                <span className="text-[#646970]">
                  {g.yes} helpful · {g.no} not helpful ({Math.round(g.rate * 100)}% positive)
                </span>
              </li>
            ))}
          </ul>
        </AdminPanel>
      )}

      {loading ? (
        <AdminLoading />
      ) : rows.length === 0 ? (
        <AdminNotice tone="info">
          No feedback yet. When visitors vote on a guide, their answers will show up in the table
          below.
        </AdminNotice>
      ) : (
        <AdminTable headers={["Guide", "Vote", "When", ""]}>
          {rows.map((r) => (
            <tr key={r.id} className={wp.tr}>
              <td className={wp.td + " font-mono text-[12px]"}>{r.guide_slug}</td>
              <td className={wp.td}>
                {r.correct ? (
                  <span className="inline-flex items-center gap-1 text-[#00a32a]">
                    <ThumbsUp className="h-3.5 w-3.5" /> Helpful
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#b32d2e]">
                    <ThumbsDown className="h-3.5 w-3.5" /> Not helpful
                  </span>
                )}
              </td>
              <td className={wp.td + " text-[12px] text-[#646970]">
                {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
              </td>
              <td className={wp.td + " text-right"}>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="inline-flex items-center gap-1 text-[#b32d2e] hover:underline"
                  title="Delete this vote"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
