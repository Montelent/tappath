"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

const TABLES = [
  { id: "guides", label: "Guides" },
  { id: "brands", label: "Brands" },
  { id: "topics", label: "Topics" },
  { id: "devices", label: "Devices" },
  { id: "glossary_terms", label: "Glossary" },
  { id: "forum_topics", label: "Forum topics" },
  { id: "guide_feedback", label: "Feedback" },
  { id: "profiles", label: "Users (no passwords)" },
] as const;

export default function BulkExport() {
  const [table, setTable] = useState<string>("guides");
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/export?table=${encodeURIComponent(table)}&format=${format}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Export failed (${res.status})`);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const match = /filename="([^"]+)"/.exec(cd);
      const name = match?.[1] || `tappath-${table}.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bulk export</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Download Neon tables as JSON or CSV.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Table</span>
          <select
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            {TABLES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "json" | "csv")}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </label>
        <button
          type="button"
          onClick={download}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download {format.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
