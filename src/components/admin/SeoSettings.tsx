"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2, Save, Plus, Trash2, Search, ExternalLink, Globe, FileText,
  BookMarked, Smartphone, Tag, LayoutGrid, Home, Link2,
} from "lucide-react";
import type { SeoRedirect, SiteSettings } from "@/lib/site-settings";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/site-settings";
import { SEO_SHORTCODES, seoPreviewDescription, seoPreviewTitle } from "@/lib/seo/templates";
import { cn } from "@/lib/utils";

type Settings = SiteSettings;
type TabId = "global" | "homepage" | "guides" | "pages" | "glossary" | "devices" | "brands" | "topics" | "webmaster" | "redirects";

const TABS: { id: TabId; label: string; icon: typeof Globe }[] = [
  { id: "global", label: "Global Meta", icon: Globe },
  { id: "homepage", label: "Homepage", icon: Home },
  { id: "guides", label: "Guides", icon: FileText },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "glossary", label: "Glossary", icon: BookMarked },
  { id: "devices", label: "Devices", icon: Smartphone },
  { id: "brands", label: "Brands", icon: Tag },
  { id: "topics", label: "Topics", icon: LayoutGrid },
  { id: "webmaster", label: "Webmaster", icon: Search },
  { id: "redirects", label: "Redirects", icon: Link2 },
];

const SAMPLE: Record<string, Record<string, string>> = {
  guides: { title: "Add a Fingerprint", brand: "Samsung", excerpt: "Set up fingerprint unlock on Galaxy phones.", product_line: "Galaxy" },
  pages: { title: "About Us", excerpt: "Learn more about our website and editorial mission." },
  glossary: { title: "NFC", term: "NFC", excerpt: "Near Field Communication for short-range wireless data exchange.", category: "Network" },
  devices: { title: "Galaxy S24 Ultra", device: "Galaxy S24 Ultra", brand: "Samsung", excerpt: "Guides and specs for Galaxy S24 Ultra." },
  brands: { title: "Samsung", brand: "Samsung", excerpt: "Step-by-step guides for Samsung Galaxy." },
  topics: { title: "Network & Connectivity", excerpt: "Private DNS, VoLTE, Wi-Fi and more.", category: "Network" },
  homepage: { title: "Home", excerpt: "Exact menu paths for Samsung, Xiaomi and more." },
};

export default function SeoSettings() {
  const [settings, setSettings] = useState<Settings>({ ...SITE_SETTINGS_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<TabId>("guides");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      const data = await res.json();
      if (data.settings) setSettings({ ...SITE_SETTINGS_DEFAULTS, ...data.settings });
    } catch {
      setMessage("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Save failed");
      else setMessage("Titles & meta saved. Frontend pages use these templates immediately.");
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  const varsBase = useMemo(
    () => ({ sitename: settings.site_name || "TapPath", sep: settings.seo_title_separator || "·" }),
    [settings.site_name, settings.seo_title_separator]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Titles & Meta</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Rank Math–style templates with shortcodes for Pages, Guides, Glossary, Devices, and more.
          </p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded bg-[#2271b1] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#135e96] disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      {message && (
        <p className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">{message}</p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="w-full shrink-0 lg:w-52">
          <ul className="space-y-0.5 rounded border border-[var(--border)] bg-[var(--card)] p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <li key={t.id}>
                  <button type="button" onClick={() => setTab(t.id)} className={cn("flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition", active ? "bg-[#2271b1] font-medium text-white" : "text-[var(--foreground)] hover:bg-[var(--muted)]")}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 flex-1 space-y-6">
          {tab === "global" && (
            <Panel title="Global Meta">
              <Field label="Separator Character" help="Used wherever you put %sep% in a template." value={settings.seo_title_separator} onChange={(v) => set("seo_title_separator", v)} />
              <Field label="Site name (for %sitename%)" value={settings.site_name} onChange={(v) => set("site_name", v)} />
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.seo_robots_index !== false} onChange={(e) => set("seo_robots_index", e.target.checked)} /> Index site in search engines</label>
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.seo_robots_follow !== false} onChange={(e) => set("seo_robots_follow", e.target.checked)} /> Follow links</label>
              </div>
            </Panel>
          )}

          {tab === "homepage" && <TemplatePanel title="Homepage" titleKey="seo_tpl_homepage_title" descKey="seo_tpl_homepage_description" settings={settings} set={set} sample={{ ...varsBase, ...SAMPLE.homepage }} shortcodes={["%sitename%", "%sep%", "%excerpt%"]} />}
          {tab === "pages" && <TemplatePanel title="Single Page" titleKey="seo_tpl_page_title" descKey="seo_tpl_page_description" settings={settings} set={set} sample={{ ...varsBase, ...SAMPLE.pages }} shortcodes={["%title%", "%sep%", "%sitename%", "%excerpt%"]} />}
          {tab === "guides" && <TemplatePanel title="Single Guide" titleKey="seo_tpl_guide_title" descKey="seo_tpl_guide_description" settings={settings} set={set} sample={{ ...varsBase, ...SAMPLE.guides }} shortcodes={["%title%", "%sep%", "%brand%", "%sitename%", "%excerpt%", "%product_line%"]} />}
          {tab === "glossary" && <TemplatePanel title="Glossary Term" titleKey="seo_tpl_glossary_title" descKey="seo_tpl_glossary_description" settings={settings} set={set} sample={{ ...varsBase, ...SAMPLE.glossary }} shortcodes={["%term%", "%title%", "%sep%", "%sitename%", "%excerpt%", "%category%"]} />}
          {tab === "devices" && <TemplatePanel title="Single Device" titleKey="seo_tpl_device_title" descKey="seo_tpl_device_description" settings={settings} set={set} sample={{ ...varsBase, ...SAMPLE.devices }} shortcodes={["%device%", "%title%", "%brand%", "%sep%", "%sitename%", "%excerpt%"]} />}
          {tab === "brands" && <TemplatePanel title="Brand Hub" titleKey="seo_tpl_brand_title" descKey="seo_tpl_brand_description" settings={settings} set={set} sample={{ ...varsBase, ...SAMPLE.brands }} shortcodes={["%brand%", "%title%", "%sep%", "%sitename%", "%excerpt%"]} />}
          {tab === "topics" && <TemplatePanel title="Topic Hub" titleKey="seo_tpl_topic_title" descKey="seo_tpl_topic_description" settings={settings} set={set} sample={{ ...varsBase, ...SAMPLE.topics }} shortcodes={["%title%", "%sep%", "%sitename%", "%excerpt%", "%category%"]} />}

          {tab === "webmaster" && (
            <Panel title="Webmaster Tools">
              <p className="mb-3 text-xs text-[var(--muted-foreground)]">Paste only the verification content value from each console.</p>
              {([["seo_google_verification", "Google Search Console"], ["seo_bing_verification", "Bing Webmaster Tools"], ["seo_yandex_verification", "Yandex"], ["seo_pinterest_verification", "Pinterest"]] as const).map(([key, label]) => (
                <Field key={key} label={label} value={String(settings[key] || "")} onChange={(v) => set(key, v)} mono />
              ))}
            </Panel>
          )}

          {tab === "redirects" && <RedirectsPanel settings={settings} set={set} />}

          <div className="flex justify-end border-t border-[var(--border)] pt-4">
            <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded bg-[#2271b1] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#135e96] disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="border-b border-[var(--border)] bg-[var(--muted)]/40 px-4 py-2.5 text-sm font-semibold">{title}</div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}

function Field({ label, help, value, onChange, mono }: { label: string; help?: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[var(--foreground)]">{label}</span>
      {help && <span className="mb-1 block text-[11px] text-[var(--muted-foreground)]">{help}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} className={cn("w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm", mono && "font-mono")} />
    </label>
  );
}

function TemplatePanel({
  title, titleKey, descKey, settings, set, sample, shortcodes,
}: {
  title: string; titleKey: keyof SiteSettings; descKey: keyof SiteSettings; settings: Settings;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  sample: Record<string, string>; shortcodes: string[];
}) {
  const titleTpl = String(settings[titleKey] || "");
  const descTpl = String(settings[descKey] || "");
  const previewTitle = seoPreviewTitle(titleTpl, sample);
  const previewDesc = seoPreviewDescription(descTpl, sample);
  const insert = (field: "title" | "desc", code: string) => {
    if (field === "title") set(titleKey, (titleTpl + " " + code).trim() as never);
    else set(descKey, (descTpl + " " + code).trim() as never);
  };
  return (
    <Panel title={title}>
      <p className="text-xs text-[var(--muted-foreground)]">Use shortcodes like Rank Math. Click a chip to insert. Preview updates live.</p>
      <div className="rounded border border-[var(--border)] bg-white p-4 dark:bg-neutral-950">
        <div className="mb-1 text-[11px] uppercase tracking-wide text-[var(--muted-foreground)]">Google preview</div>
        <div className="truncate text-lg text-[#1a0dab] dark:text-blue-400">{previewTitle}</div>
        <div className="truncate text-xs text-emerald-700 dark:text-emerald-400">https://example.com/...</div>
        <div className="mt-1 text-sm leading-snug text-[var(--muted-foreground)]">{previewDesc}</div>
      </div>
      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold">Single Title</span>
          <span className={cn("text-[11px]", previewTitle.length > 60 ? "text-amber-600" : "text-[var(--muted-foreground)]")} >~{previewTitle.length}/60</span>
        </div>
        <div className="mb-1.5 flex flex-wrap gap-1">
          {shortcodes.map((c) => (
            <button key={c} type="button" onClick={() => insert("title", c)} className="rounded border border-[var(--border)] bg-[var(--muted)]/50 px-1.5 py-0.5 font-mono text-[10px] hover:border-[#2271b1] hover:text-[#2271b1]">{c}</button>
          ))}
        </div>
        <input value={titleTpl} onChange={(e) => set(titleKey, e.target.value as never)} className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm" placeholder="%title% %sep% %sitename%" />
      </div>
      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold">Single Description</span>
          <span className={cn("text-[11px]", previewDesc.length > 160 ? "text-amber-600" : "text-[var(--muted-foreground)]")} >~{previewDesc.length}/160</span>
        </div>
        <div className="mb-1.5 flex flex-wrap gap-1">
          {shortcodes.map((c) => (
            <button key={`d-${c}`} type="button" onClick={() => insert("desc", c)} className="rounded border border-[var(--border)] bg-[var(--muted)]/50 px-1.5 py-0.5 font-mono text-[10px] hover:border-[#2271b1] hover:text-[#2271b1]">{c}</button>
          ))}
        </div>
        <textarea value={descTpl} onChange={(e) => set(descKey, e.target.value as never)} rows={3} className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm" placeholder="%excerpt%" />
      </div>
      <details className="text-xs text-[var(--muted-foreground)]">
        <summary className="cursor-pointer font-medium text-[var(--foreground)]">All available shortcodes</summary>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {SEO_SHORTCODES.map((s) => (
            <li key={s.code}><code className="rounded bg-[var(--muted)] px-1">{s.code}</code> — {s.label}</li>
          ))}
        </ul>
      </details>
    </Panel>
  );
}

function RedirectsPanel({ settings, set }: { settings: Settings; set: <K extends keyof Settings>(key: K, value: Settings[K]) => void }) {
  const redirects: SeoRedirect[] = Array.isArray(settings.seo_redirects) ? settings.seo_redirects : [];
  const updateRedirect = (i: number, patch: Partial<SeoRedirect>) => {
    const next = [...redirects];
    next[i] = { ...next[i], ...patch };
    set("seo_redirects", next);
  };
  return (
    <Panel title="Redirects">
      <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
        When you change a saved guide's URL slug, brand or product line in the Guide Editor, TapPath automatically adds a permanent 301 redirect from the old URL to the new URL. Those automatic redirects appear here too, and can be reviewed or removed. You can also add redirects manually.
      </p>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={settings.seo_redirect_trailing_slash !== false} onChange={(e) => set("seo_redirect_trailing_slash", e.target.checked)} />
        Auto-strip trailing slashes (301)
      </label>
      <div className="flex justify-end">
        <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-[#2271b1]" onClick={() => set("seo_redirects", [...redirects, { id: crypto.randomUUID(), from: "", to: "", code: 301, enabled: true }])}>
          <Plus className="h-3.5 w-3.5" /> Add redirect
        </button>
      </div>
      {redirects.map((r, i) => (
        <div key={r.id || i} className="grid gap-2 rounded border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
          <input value={r.from} onChange={(e) => updateRedirect(i, { from: e.target.value })} placeholder="/old-path" className="rounded border border-[var(--border)] px-2 py-1.5 text-sm" />
          <input value={r.to} onChange={(e) => updateRedirect(i, { to: e.target.value })} placeholder="/new-path" className="rounded border border-[var(--border)] px-2 py-1.5 text-sm" />
          <select value={r.code} onChange={(e) => updateRedirect(i, { code: Number(e.target.value) as 301 | 302 })} className="rounded border border-[var(--border)] px-2 py-1.5 text-sm">
            <option value={301}>301</option>
            <option value={302}>302</option>
          </select>
          <label className="inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={r.enabled !== false} onChange={(e) => updateRedirect(i, { enabled: e.target.checked })} /> On</label>
          <button type="button" className="text-red-500" onClick={() => set("seo_redirects", redirects.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <a href="/robots.txt" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#2271b1]">View robots.txt <ExternalLink className="h-3 w-3" /></a>
    </Panel>
  );
}
