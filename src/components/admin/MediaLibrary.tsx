"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, RefreshCw, Copy, ExternalLink } from "lucide-react";

type MediaRow = {
  id: string;
  url: string;
  filename: string;
  mime: string;
  alt: string;
  size_bytes?: number | null;
  created_at?: string;
};

export default function MediaLibrary() {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [alt, setAlt] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/media", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to load");
      else {
        setRows((data.rows || []) as MediaRow[]);
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

  const add = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, filename, alt }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Add failed");
      else {
        setMessage("Asset added");
        setUrl("");
        setFilename("");
        setAlt("");
        await load();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this asset from the library?")) return;
    const res = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) await load();
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("URL copied");
    } catch {
      setMessage("Copy failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media library</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Register public image/file URLs for reuse in guides.
          </p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{error}</p>
      )}
      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}

      <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">URL *</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Filename</span>
          <input value={filename} onChange={(e) => setFilename(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Alt text</span>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
        </label>
        <button type="button" onClick={add} disabled={saving || !url.trim()} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 sm:col-span-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add asset
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex h-32 items-center justify-center bg-[var(--muted)]/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt={r.alt || r.filename} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="space-y-2 p-3">
                <div className="truncate text-sm font-medium">{r.filename || "asset"}</div>
                <div className="truncate text-xs text-[var(--muted-foreground)]">{r.url}</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => copy(r.url)} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-1 text-xs">
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                  <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-1 text-xs">
                    <ExternalLink className="h-3 w-3" /> Open
                  </a>
                  <button type="button" onClick={() => remove(r.id)} className="ml-auto text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-[var(--muted-foreground)]">No media yet. Add a public image URL above.</p>
          )}
        </div>
      )}
    </div>
  );
}
