"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save, RefreshCw, Database } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SortOrderField, { nextSortOrder } from "@/components/admin/SortOrderField";
import SeoMetaBox from "@/components/admin/SeoMetaBox";
import { applySeoTemplate } from "@/lib/seo/templates";

type Props = {
  table: string;
  title: string;
  columns: { key: string; label: string }[];
  emptyRow: Record<string, unknown>;
  fields: {
    key: string;
    label: string;
    type?: "text" | "textarea" | "richtext" | "number" | "boolean" | "json" | "faq-list" | "related-list" | "seo-box";
    help?: string;
  }[];
};

export default function ContentManager({ table, title, columns, emptyRow, fields }: Props) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDb, setUsingDb] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [seoTpl, setSeoTpl] = useState({
    guideTitle: "%title% %sep% %brand% %sep% %sitename%",
    guideDescription: "%excerpt%",
    pageTitle: "%title% %sep% %sitename%",
    pageDescription: "%excerpt%",
    glossaryTitle: "What is %term%? %sep% %sitename%",
    glossaryDescription: "%excerpt%",
    sep: "·",
    siteName: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/content/${table}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok && data.error && !data.rows) {
        setError(data.error);
        setRows([]);
      } else {
        setRows(data.rows || []);
        setUsingDb(!!data.usingSupabase || !!data.usingDb);
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
          pageTitle: String(s.seo_tpl_page_title || "%title% %sep% %sitename%"),
          pageDescription: String(s.seo_tpl_page_description || "%excerpt%"),
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

  const remove = async (id: string) => {
    if (!confirm("Move this item to trash? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/content/${table}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) await load();
  };

  const seed = async () => {
    setSeeding(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/seed", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Seed failed");
      else {
        setMessage(`Seeded: ${JSON.stringify(data.results)}`);
        await load();
      }
    } catch {
      setMessage("Seed network error");
    } finally {
      setSeeding(false);
    }
  };

  const filtered = rows.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q));
  });

  if (loading && !editing) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-[var(--muted-foreground)]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading {title}…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {usingDb ? (
              <span className="text-emerald-600">Neon connected — edits persist</span>
            ) : (
              <span className="text-amber-600">DATABASE_URL missing</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => load()} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button type="button" onClick={seed} disabled={seeding} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
            {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
            Seed DB
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing({
                ...emptyRow,
                ...(typeof emptyRow.sort_order === "number" ? { sort_order: nextSortOrder(rows) } : {}),
              });
              setTimeout(() => document.getElementById("content-edit-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}
      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{error}</p>
      )}

      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={`Search ${title.toLowerCase()}…`}
        className="w-full max-w-md rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm"
      />

      {editing ? (
        <div id="content-edit-form" className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--card)] px-5 py-3">
            <h2 className="font-semibold">{editing.id ? `Edit ${title}` : `Create ${title}`}</h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
              </button>
              <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">Cancel</button>
            </div>
          </div>
          <div className="grid gap-4">
            {fields.map((f) => {
              if (f.type === "seo-box") {
                return (
                  <div key={f.key}>
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
                        table === "pages"
                          ? applySeoTemplate(seoTpl.pageTitle, { title: String(editing.title || ""), sitename: seoTpl.siteName, sep: seoTpl.sep, excerpt: String(editing.excerpt || "") }, String(editing.title || "Title"))
                          : table === "glossary_terms"
                          ? applySeoTemplate(seoTpl.glossaryTitle, { title: String(editing.term || ""), term: String(editing.term || ""), sitename: seoTpl.siteName, sep: seoTpl.sep, excerpt: String(editing.short || ""), category: String(editing.category || "") }, String(editing.term || "Title"))
                          : applySeoTemplate(seoTpl.guideTitle, { title: String(editing.title || ""), brand: String(editing.brand || ""), sitename: seoTpl.siteName, sep: seoTpl.sep, excerpt: String(editing.short_description || "") }, String(editing.title || "Title"))
                      }
                      defaultDescription={
                        table === "pages"
                          ? applySeoTemplate(seoTpl.pageDescription, { title: String(editing.title || ""), sitename: seoTpl.siteName, sep: seoTpl.sep, excerpt: String(editing.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) }, String(editing.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160))
                          : table === "glossary_terms"
                          ? applySeoTemplate(seoTpl.glossaryDescription, { title: String(editing.term || ""), term: String(editing.term || ""), sitename: seoTpl.siteName, sep: seoTpl.sep, excerpt: String(editing.short || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) }, String(editing.short || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160))
                          : applySeoTemplate(seoTpl.guideDescription, { title: String(editing.title || ""), brand: String(editing.brand || ""), sitename: seoTpl.siteName, sep: seoTpl.sep, excerpt: String(editing.short_description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) }, String(editing.short_description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160))
                      }
                      pathPreview={table === "glossary_terms" ? `/glossary/${String(editing.slug || "")}` : table === "pages" ? `/pages/${String(editing.slug || "")}` : `/${String(editing.slug || "")}`}
                      imageUrl={String(editing.featured_image_url || editing.og_image || "") || undefined}
                    />
                  </div>
                );
              }
              if (f.type === "faq-list") {
                const faqs = Array.isArray(editing.faqs) ? (editing.faqs as { q?: string; a?: string }[]) : [];
                return (
                  <div key={f.key} className="space-y-3 rounded-xl border border-[var(--border)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">{f.label}</span>
                      <button type="button" className="text-xs text-brand-600 hover:underline" onClick={() => setEditing({ ...editing, faqs: [...faqs, { q: "", a: "" }] })}>+ Add FAQ</button>
                    </div>
                    {f.help && <p className="text-[11px] text-[var(--muted-foreground)]">{f.help}</p>}
                    {faqs.map((item, i) => (
                      <div key={i} className="space-y-2 rounded-lg bg-[var(--muted)]/30 p-3">
                        <input value={item.q || ""} onChange={(e) => { const next = [...faqs]; next[i] = { ...next[i], q: e.target.value }; setEditing({ ...editing, faqs: next }); }} placeholder="Question" className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
                        <textarea value={item.a || ""} onChange={(e) => { const next = [...faqs]; next[i] = { ...next[i], a: e.target.value }; setEditing({ ...editing, faqs: next }); }} placeholder="Answer" rows={2} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
                        <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setEditing({ ...editing, faqs: faqs.filter((_, j) => j !== i) })}>Remove</button>
                      </div>
                    ))}
                  </div>
                );
              }
              if (f.type === "related-list") {
                const related = Array.isArray(editing.related_guides) ? (editing.related_guides as { title?: string; href?: string }[]) : [];
                return (
                  <div key={f.key} className="space-y-3 rounded-xl border border-[var(--border)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">{f.label}</span>
                      <button type="button" className="text-xs text-brand-600 hover:underline" onClick={() => setEditing({ ...editing, related_guides: [...related, { title: "", href: "" }] })}>+ Add link</button>
                    </div>
                    {f.help && <p className="text-[11px] text-[var(--muted-foreground)]">{f.help}</p>}
                    {related.map((item, i) => (
                      <div key={i} className="flex flex-wrap gap-2">
                        <input value={item.title || ""} onChange={(e) => { const next = [...related]; next[i] = { ...next[i], title: e.target.value }; setEditing({ ...editing, related_guides: next }); }} placeholder="Title" className="min-w-[120px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
                        <input value={item.href || ""} onChange={(e) => { const next = [...related]; next[i] = { ...next[i], href: e.target.value }; setEditing({ ...editing, related_guides: next }); }} placeholder="/path" className="min-w-[120px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm" />
                        <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setEditing({ ...editing, related_guides: related.filter((_, j) => j !== i) })}>Remove</button>
                      </div>
                    ))}
                  </div>
                );
              }
              if (f.type === "boolean") {
                return (
                  <label key={f.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!editing[f.key]} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })} className="h-4 w-4" />
                    {f.label}
                  </label>
                );
              }
              if (f.type === "number") {
                return (
                  <label key={f.key} className="block">
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{f.label}</span>
                    <input type="number" value={editing[f.key] == null ? "" : Number(editing[f.key])} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value === "" ? null : Number(e.target.value) })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
                  </label>
                );
              }
              if (f.type === "textarea" || f.type === "json") {
                return (
                  <label key={f.key} className="block">
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{f.label}</span>
                    <textarea
                      value={f.type === "json" ? (typeof editing[f.key] === "string" ? String(editing[f.key]) : JSON.stringify(editing[f.key] ?? [], null, 2)) : String(editing[f.key] ?? "")}
                      onChange={(e) => {
                        if (f.type === "json") {
                          try { setEditing({ ...editing, [f.key]: JSON.parse(e.target.value) }); }
                          catch { setEditing({ ...editing, [f.key]: e.target.value }); }
                        } else setEditing({ ...editing, [f.key]: e.target.value });
                      }}
                      rows={4}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm"
                    />
                    {f.help && <span className="mt-1 block text-[11px] text-[var(--muted-foreground)]">{f.help}</span>}
                  </label>
                );
              }
              if (f.type === "richtext") {
                return (
                  <div key={f.key}>
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{f.label}</span>
                    <RichTextEditor value={String(editing[f.key] ?? "")} onChange={(html) => setEditing({ ...editing, [f.key]: html })} />
                  </div>
                );
              }
              if (f.key === "sort_order") {
                return (
                  <div key={f.key}>
                    <SortOrderField value={Number(editing.sort_order) || 0} onChange={(v) => setEditing({ ...editing, sort_order: v })} autoValue={nextSortOrder(rows, editing.id != null ? String(editing.id) : undefined)} />
                  </div>
                );
              }
              return (
                <label key={f.key} className="block">
                  <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{f.label}</span>
                  <input value={String(editing[f.key] ?? "")} onChange={(e) => {
                    const value = e.target.value;
                    const slugify = (input: string) => input
                      .normalize("NFKD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    const previousAutoSlug = slugify(String(editing.title || ""));
                    const nextSlug = slugify(value);
                    const shouldUpdatePageSlug =
                      table === "pages" &&
                      f.key === "title" &&
                      (!String(editing.slug || "") || String(editing.slug) === previousAutoSlug);
                    setEditing({
                      ...editing,
                      [f.key]: value,
                      ...(shouldUpdatePageSlug ? { slug: nextSlug } : {}),
                    });
                  }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
                  {f.help && <span className="mt-1 block text-[11px] text-[var(--muted-foreground)]">{f.help}</span>}
                </label>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
            <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save to database
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-[var(--muted)]/40 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="whitespace-nowrap px-4 py-3">{c.label}</th>
                ))}
                <th className="w-[220px] whitespace-nowrap px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={String(r.id || r.slug)} className="border-t border-[var(--border)] hover:bg-[var(--muted)]/30">
                  {columns.map((c) => (
                    <td key={c.key} className="max-w-[320px] break-words px-4 py-4 align-middle">
                      {c.key === "published" ? (
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.published ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>
                          {r.published ? "Published" : "Draft"}
                        </span>
                      ) : String(r[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-4 align-middle">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button type="button" className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-[var(--muted)]" onClick={() => { setEditing(r); setTimeout(() => document.getElementById("content-edit-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40); }}>Edit</button>
                      {(table === "glossary_terms" || table === "pages") && r.slug && r.published ? (
                        <a href={table === "pages" ? `/pages/${String(r.slug)}` : `/glossary/${String(r.slug)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]">View</a>
                      ) : null}
                      {r.id != null && <button type="button" className="inline-flex min-h-9 items-center justify-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950" onClick={() => remove(String(r.id))}>Trash</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-[var(--muted-foreground)]">No items yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
