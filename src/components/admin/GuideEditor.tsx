"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2, Plus, Trash2, Save, RefreshCw, Database, ExternalLink, Eye, EyeOff, Image as ImageIcon,
} from "lucide-react";
import SearchableSelect from "@/components/admin/SearchableSelect";
import GuideVersionsEditor from "@/components/admin/GuideVersionsEditor";
import RichTextEditor from "@/components/admin/RichTextEditor";
import GuideMetaFields from "@/components/admin/GuideMetaFields";
import SeoMetaBox from "@/components/admin/SeoMetaBox";
import { applySeoTemplate } from "@/lib/seo/templates";
import {
  slugify, formatUpdatedLabel, formatModifiedDate, estimateReadTime, GUIDE_CATEGORIES,
} from "@/lib/admin/guideHelpers";

type Faq = { q: string; a: string };
type Version = {
  id?: string;
  label: string;
  steps?: {
    id?: number;
    instruction?: string;
    highlight?: string;
    detail?: string;
    imageUrl?: string;
    markerX?: number;
    markerY?: number;
  }[];
};
type GuideRow = {
  id?: string; slug: string; brand: string; brand_slug: string; product_line: string;
  title: string; short_description: string; updated_label: string; read_time: string;
  category: string; versions: Version[]; article: string[]; faqs: Faq[];
  related: { title: string; href: string; category: string }[];
  compatible_devices: { name: string; os: string; href: string }[];
  confirmations: number; forum_verified: boolean; published: boolean;
  updated_at?: string;
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  focus_keyword?: string;
  canonical_url?: string;
  robots_index?: boolean;
  robots_follow?: boolean;
  og_title?: string;
  og_description?: string;
  og_image?: string;
};

type BrandOpt = { name: string; slug: string; product_lines: { name: string }[] };

const emptyGuide = (): GuideRow => ({
  slug: "", brand: "Samsung", brand_slug: "samsung", product_line: "Galaxy",
  title: "", short_description: "", updated_label: formatUpdatedLabel(), read_time: "1 min",
  category: "Display & Home Screen",
  versions: [{ id: "v1", label: "Latest", steps: [{ instruction: "", highlight: "" }] }],
  article: [""], faqs: [{ q: "", a: "" }], related: [], compatible_devices: [],
  confirmations: 0, forum_verified: false, published: false,
  featured_image_url: "",
  seo_title: "",
  seo_description: "",
  focus_keyword: "",
  canonical_url: "",
  robots_index: true,
  robots_follow: true,
  og_title: "",
  og_description: "",
  og_image: "",
});

function previewHref(g: GuideRow) {
  if (!g.brand_slug || !g.product_line || !g.slug) return null;
  return `/${g.brand_slug}/${slugify(g.product_line)}/${g.slug}`;
}

function guideTemplateTitle(
  g: GuideRow,
  tpl: { title: string; sep: string; siteName: string }
): string {
  return applySeoTemplate(
    tpl.title,
    {
      title: g.title || "Guide title",
      brand: g.brand || "",
      sitename: tpl.siteName,
      sep: tpl.sep,
      product_line: g.product_line || "",
      excerpt: "",
    },
    [g.title, g.brand, tpl.siteName].filter(Boolean).join(` ${tpl.sep} `)
  );
}

function guideTemplateDescription(
  g: GuideRow,
  tpl: { description: string; sep: string; siteName: string }
): string {
  const excerpt = (g.short_description || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  return applySeoTemplate(
    tpl.description,
    {
      title: g.title || "",
      brand: g.brand || "",
      sitename: tpl.siteName,
      sep: tpl.sep,
      excerpt,
      description: excerpt,
      product_line: g.product_line || "",
    },
    excerpt
  );
}

const FALLBACK_BRANDS: BrandOpt[] = [
  { name: "Samsung", slug: "samsung", product_lines: [{ name: "Galaxy" }] },
  { name: "Xiaomi", slug: "xiaomi", product_lines: [{ name: "Smartphone" }, { name: "Redmi" }, { name: "POCO" }] },
  { name: "Google", slug: "google", product_lines: [{ name: "Pixel" }] },
  { name: "OnePlus", slug: "oneplus", product_lines: [{ name: "OnePlus" }] },
  { name: "Oppo", slug: "oppo", product_lines: [{ name: "Find" }, { name: "Reno" }] },
  { name: "Realme", slug: "realme", product_lines: [{ name: "Realme" }] },
  { name: "Huawei", slug: "huawei", product_lines: [{ name: "P series" }, { name: "Mate" }] },
  { name: "Android", slug: "android", product_lines: [{ name: "Generic" }] },
];

export default function GuideEditor() {
  const [rows, setRows] = useState<GuideRow[]>([]);
  const [brands, setBrands] = useState<BrandOpt[]>(FALLBACK_BRANDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDb, setUsingDb] = useState(false);
  const [editing, setEditing] = useState<GuideRow | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [listSearch, setListSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [seoTpl, setSeoTpl] = useState({
    title: "%title% %sep% %brand% %sep% %sitename%",
    description: "%excerpt%",
    sep: "·",
    siteName: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [gRes, bRes] = await Promise.all([
        fetch("/api/admin/content/guides", { credentials: "include" }),
        fetch("/api/admin/content/brands", { credentials: "include" }),
      ]);
      const gData = await gRes.json();
      const bData = await bRes.json();
      if (!gRes.ok && gData.error && !gData.rows) {
        setError(gData.error); setRows([]); setUsingDb(false);
      } else {
        setRows((gData.rows || []) as GuideRow[]);
        setUsingDb(!!gData.usingSupabase);
        if (gData.error) setError(gData.error);
      }
      const brandRows = (bData.rows || []) as Record<string, unknown>[];
      if (brandRows.length) {
        setBrands(brandRows.map((b) => ({
          name: String(b.name || ""),
          slug: String(b.slug || ""),
          product_lines: Array.isArray(b.product_lines) ? (b.product_lines as { name: string }[]) : [],
        })));
      }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/site-settings", { credentials: "include" });
        const data = await res.json();
        const s = data.settings || {};
        if (cancelled) return;
        setSeoTpl({
          title: String(s.seo_tpl_guide_title || "%title% %sep% %brand% %sep% %sitename%"),
          description: String(s.seo_tpl_guide_description || "%excerpt%"),
          sep: String(s.seo_title_separator || "·").trim() || "·",
          siteName: String(s.site_name || ""),
        });
      } catch { /* keep defaults */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.slug, label: b.name, meta: b.slug })),
    [brands]
  );

  const productLineOptions = useMemo(() => {
    if (!editing) return [];
    const brand = brands.find((b) => b.slug === editing.brand_slug || b.name === editing.brand);
    const opts = (brand?.product_lines || []).map((pl) => ({
      value: pl.name, label: pl.name, meta: slugify(pl.name),
    }));
    if (editing.product_line && !opts.some((o) => o.value === editing.product_line)) {
      opts.unshift({ value: editing.product_line, label: editing.product_line, meta: slugify(editing.product_line) });
    }
    return opts;
  }, [brands, editing]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>([...GUIDE_CATEGORIES]);
    for (const r of rows) if (r.category) set.add(r.category);
    if (editing?.category) set.add(editing.category);
    return Array.from(set).sort().map((c) => ({ value: c, label: c }));
  }, [rows, editing?.category]);

  if (loading && !editing) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-[var(--muted-foreground)]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading guides…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guides</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {usingDb ? <span className="text-emerald-600">Neon connected</span>
              : <span className="text-amber-600">DATABASE_URL missing</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => load()} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button type="button" onClick={() => { setSlugLocked(false); setEditing(emptyGuide()); }}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
            <Plus className="h-3.5 w-3.5" /> New guide
          </button>
        </div>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}
      {error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      {editing ? (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="font-semibold">{editing.id ? "Edit guide" : "Create guide"}</h2>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Title</span>
            <input value={editing.title}
              onChange={(e) => {
                const title = e.target.value;
                setEditing({ ...editing, title, slug: slugLocked ? editing.slug : slugify(title) });
              }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <SearchableSelect label="Brand" value={editing.brand_slug || editing.brand} options={brandOptions}
              onChange={(val, opt) => {
                const brand = brands.find((b) => b.slug === val || b.name === val);
                const name = brand?.name || opt?.label || val;
                const slug = brand?.slug || slugify(name);
                const firstLine = brand?.product_lines?.[0]?.name || editing.product_line;
                setEditing({ ...editing, brand: name, brand_slug: slug, product_line: firstLine });
              }} />
            <SearchableSelect label="Product line" value={editing.product_line} options={productLineOptions}
              onChange={(val) => setEditing({ ...editing, product_line: val })} />
            <SearchableSelect label="Category" value={editing.category} options={categoryOptions}
              onChange={(val) => setEditing({ ...editing, category: val })} />
            <label>
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Slug</span>
              <input value={editing.slug}
                onChange={(e) => { setSlugLocked(true); setEditing({ ...editing, slug: slugify(e.target.value) }); }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Short description</span>
            <RichTextEditor
              value={editing.short_description || ""}
              onChange={(html) => setEditing({ ...editing, short_description: html })}
            />
          </label>
          <GuideVersionsEditor
            versions={editing.versions || []}
            onChange={(versions) => setEditing({ ...editing, versions })}
          />
          <SeoMetaBox
            value={{
              focus_keyword: editing.focus_keyword,
              seo_title: editing.seo_title,
              seo_description: editing.seo_description,
              canonical_url: editing.canonical_url,
              robots_index: editing.robots_index,
              robots_follow: editing.robots_follow,
              og_title: editing.og_title,
              og_description: editing.og_description,
              og_image: editing.og_image,
            }}
            onChange={(seo) => setEditing({ ...editing, ...seo })}
            defaultTitle={guideTemplateTitle(editing, seoTpl)}
            defaultDescription={guideTemplateDescription(editing, seoTpl)}
            pathPreview={previewHref(editing) || `/${editing.brand_slug || "brand"}/${editing.slug || "slug"}`}
            imageUrl={editing.featured_image_url || undefined}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={saving}
              onClick={async () => {
                if (!editing.title.trim() || !editing.slug.trim()) {
                  setMessage("Title and slug required");
                  return;
                }
                setSaving(true); setMessage("");
                try {
                  const payload = { ...editing, read_time: estimateReadTime(editing.article, editing.versions), updated_label: formatUpdatedLabel() };
                  const isNew = !editing.id;
                  const res = await fetch("/api/admin/content/guides", {
                    method: isNew ? "POST" : "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json();
                  if (!res.ok) setMessage(data.error || "Save failed");
                  else { setMessage("Saved"); setEditing(null); await load(); }
                } catch { setMessage("Network error"); }
                finally { setSaving(false); }
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save to database
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">Cancel</button>
            {previewHref(editing) && (
              <Link href={previewHref(editing)!} target="_blank" className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-4 py-2 text-sm">
                <ExternalLink className="h-3.5 w-3.5" /> Preview
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]/40 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((r) => filter === "all" || (filter === "published" ? r.published : !r.published))
                .filter((r) => !listSearch.trim() || [r.title, r.brand, r.slug].join(" ").toLowerCase().includes(listSearch.toLowerCase()))
                .map((r) => (
                <tr key={r.id || r.slug} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 font-medium">{r.title}</td>
                  <td className="px-3 py-2">{r.brand}</td>
                  <td className="px-3 py-2">{r.published ? "Published" : "Draft"}</td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" className="text-brand-600" onClick={() => { setSlugLocked(true); setEditing(r); }}>Edit</button>
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
