"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save, RefreshCw, Database } from "lucide-react";
import SeoMetaBox from "@/components/admin/SeoMetaBox";
import { applySeoTemplate } from "@/lib/seo/templates";

/** Restored ContentManager — full table editor with Rank Math SEO box linked to Titles & Meta templates. */
export default function ContentManager({ table }: { table: string }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [seoTpl, setSeoTpl] = useState({
    guideTitle: "%title% %sep% %brand% %sep% %sitename%",
    guideDescription: "%excerpt%",
    glossaryTitle: "What is %term%? %sep% %sitename%",
    glossaryDescription: "%excerpt%",
    sep: "·",
    siteName: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [usingDb, setUsingDb] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/content/${table}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok && data.error && !data.rows) {
        setError(data.error);
        setRows([]);
        setUsingDb(false);
      } else {
        setRows((data.rows || []) as Record<string, unknown>[]);
        setUsingDb(!!data.usingSupabase);
        if (data.error) setError(data.error);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/site-settings", { credentials: "include" });
        const data = await res.json();
        const s = data.settings || {};
        if (cancelled) return;
        setSeoTpl({
          guideTitle: String(s.seo_tpl_guide_title || "%title% %sep% %brand% %sep% %sitename%"),
          guideDescription: String(s.seo_tpl_guide_description || "%excerpt%"),
          glossaryTitle: String(s.seo_tpl_glossary_title || "What is %term%? %sep% %sitename%"),
          glossaryDescription: String(s.seo_tpl_glossary_description || "%excerpt%"),
          sep: String(s.seo_title_separator || "·").trim() || "·",
          siteName: String(s.site_name || ""),
        });
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setMessage("");
    try {
      const isNew = !editing.id;
      const res = await fetch(`/api/admin/content/${table}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Save failed");
      else {
        setMessage("Saved");
        setEditing(null);
        await load();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !editing) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-[var(--muted-foreground)]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight capitalize">{table.replace(/_/g, " ")}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {usingDb ? (
              <span className="text-emerald-600">Neon connected</span>
            ) : (
              <span className="text-amber-600">DATABASE_URL missing</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setEditing({ published: true })}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}
      {error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      {editing ? (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="font-semibold">{editing.id ? "Edit" : "Create"}</h2>
          {table === "glossary_terms" ? (
            <>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Term</span>
                <input
                  value={String(editing.term || "")}
                  onChange={(e) => setEditing({ ...editing, term: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Slug</span>
                <input
                  value={String(editing.slug || "")}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Short</span>
                <textarea
                  value={String(editing.short || "")}
                  onChange={(e) => setEditing({ ...editing, short: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                />
              </label>
            </>
          ) : (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Title</span>
              <input
                value={String(editing.title || "")}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </label>
          )}

          <SeoMetaBox
            value={{
              focus_keyword: String(editing.focus_keyword ?? ""),
              seo_title: String(editing.seo_title ?? ""),
              seo_description: String(editing.seo_description ?? ""),
              canonical_url: String(editing.canonical_url ?? ""),
              robots_index: editing.robots_index !== false,
              robots_follow: editing.robots_follow !== false,
              og_title: String(editing.og_title ?? ""),
              og_description: String(editing.og_description ?? ""),
              og_image: String(editing.og_image ?? ""),
            }}
            onChange={(seo) => setEditing({ ...editing, ...seo })}
            defaultTitle={
              table === "glossary_terms"
                ? applySeoTemplate(
                    seoTpl.glossaryTitle,
                    {
                      title: String(editing.term || ""),
                      term: String(editing.term || ""),
                      sitename: seoTpl.siteName,
                      sep: seoTpl.sep,
                      excerpt: String(editing.short || ""),
                      category: String(editing.category || ""),
                    },
                    String(editing.term || "Title")
                  )
                : applySeoTemplate(
                    seoTpl.guideTitle,
                    {
                      title: String(editing.title || ""),
                      brand: String(editing.brand || ""),
                      sitename: seoTpl.siteName,
                      sep: seoTpl.sep,
                      excerpt: String(editing.short_description || ""),
                    },
                    String(editing.title || "Title")
                  )
            }
            defaultDescription={
              table === "glossary_terms"
                ? applySeoTemplate(
                    seoTpl.glossaryDescription,
                    {
                      title: String(editing.term || ""),
                      term: String(editing.term || ""),
                      sitename: seoTpl.siteName,
                      sep: seoTpl.sep,
                      excerpt: String(editing.short || "")
                        .replace(/<[^>]+>/g, " ")
                        .replace(/\s+/g, " ")
                        .trim()
                        .slice(0, 160),
                    },
                    String(editing.short || "")
                      .replace(/<[^>]+>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()
                      .slice(0, 160)
                  )
                : applySeoTemplate(
                    seoTpl.guideDescription,
                    {
                      title: String(editing.title || ""),
                      brand: String(editing.brand || ""),
                      sitename: seoTpl.siteName,
                      sep: seoTpl.sep,
                      excerpt: String(editing.short_description || "")
                        .replace(/<[^>]+>/g, " ")
                        .replace(/\s+/g, " ")
                        .trim()
                        .slice(0, 160),
                    },
                    String(editing.short_description || "")
                      .replace(/<[^>]+>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()
                      .slice(0, 160)
                  )
            }
            pathPreview={
              table === "glossary_terms"
                ? `/glossary/${String(editing.slug || "")}`
                : `/${String(editing.slug || "")}`
            }
            imageUrl={String(editing.featured_image_url || editing.og_image || "") || undefined}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]/40 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.id || r.slug)} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 font-medium">{String(r.term || r.title || r.name || "—")}</td>
                  <td className="px-3 py-2 font-mono text-xs">{String(r.slug || "")}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-brand-600"
                      onClick={() => setEditing(r)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
