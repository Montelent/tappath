"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, RefreshCw, ImageIcon, Upload } from "lucide-react";
import {
  SITE_SETTINGS_DEFAULTS,
  type SiteSettings as Settings,
} from "@/lib/site-settings";

type FieldDef = {
  key: keyof Settings;
  label: string;
  help?: string;
  multiline?: boolean;
  type?: "text" | "email" | "url";
};

function ImageField({
  label,
  help,
  value,
  onChange,
  accept = "image/*",
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    setErr("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("alt", label);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Upload failed");
        return;
      }
      onChange(String(data.url || ""));
    } catch {
      setErr("Network error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-[var(--muted-foreground)]">
        {label}
      </span>
      {help && (
        <p className="text-[11px] text-[var(--muted-foreground)]">{help}</p>
      )}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]/40">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain p-1" />
          ) : (
            <ImageIcon className="h-6 w-6 text-[var(--muted-foreground)]" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/api/media/… or https://…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-xs"
          />
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]">
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            Upload image
            <input
              type="file"
              accept={accept}
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
                e.target.value = "";
              }}
            />
          </label>
          {value && (
            <button
              type="button"
              className="ml-2 text-xs text-red-600"
              onClick={() => onChange("")}
            >
              Clear
            </button>
          )}
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  );
}

function TextField({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const cls =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
        {def.label}
      </span>
      {def.help && (
        <p className="mb-1 text-[11px] text-[var(--muted-foreground)]">{def.help}</p>
      )}
      {def.multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          type={def.type || "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function SiteSettings() {
  const [settings, setSettings] = useState<Settings>({ ...SITE_SETTINGS_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backend, setBackend] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to load");
      else {
        setBackend(data.backend || "");
        setSettings({ ...SITE_SETTINGS_DEFAULTS, ...(data.settings || {}) });
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
      else setMessage("Settings saved — frontend will pick them up within a minute.");
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site settings</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {backend === "neon" ? (
              <span className="text-emerald-600">Stored in Neon · drives the live frontend</span>
            ) : (
              <span className="text-amber-600">Mock defaults (set DATABASE_URL for persistence)</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {error}
        </p>
      )}
      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}

      <Section
        title="Branding"
        description="Logo and favicon appear in the header and browser tab. Upload or paste a media URL."
      >
        <ImageField
          label="Logo"
          help="Shown in the header (and footer if no separate mark). PNG/SVG recommended."
          value={settings.logo_url}
          onChange={(v) => set("logo_url", v)}
        />
        <ImageField
          label="Favicon"
          help="Browser tab icon. Square PNG or ICO, 32×32 or 64×64 works best."
          value={settings.favicon_url}
          onChange={(v) => set("favicon_url", v)}
          accept="image/png,image/x-icon,image/svg+xml,image/webp"
        />
        <ImageField
          label="Open Graph image"
          help="Social share preview (1200×630 recommended). Defaults to /og.png."
          value={settings.og_image_url}
          onChange={(v) => set("og_image_url", v)}
        />
        <TextField
          def={{ key: "site_name", label: "Site name" }}
          value={settings.site_name}
          onChange={(v) => set("site_name", v)}
        />
        <TextField
          def={{
            key: "site_tagline",
            label: "Tagline",
            help: "Short line used in SEO and marketing copy.",
          }}
          value={settings.site_tagline}
          onChange={(v) => set("site_tagline", v)}
        />
      </Section>

      <Section title="SEO & contact" description="Default document title, description, and support email.">
        <TextField
          def={{ key: "meta_title", label: "Default page title" }}
          value={settings.meta_title}
          onChange={(v) => set("meta_title", v)}
        />
        <TextField
          def={{
            key: "meta_description",
            label: "Meta description",
            multiline: true,
          }}
          value={settings.meta_description}
          onChange={(v) => set("meta_description", v)}
        />
        <TextField
          def={{
            key: "meta_keywords",
            label: "Meta keywords",
            help: "Comma-separated.",
          }}
          value={settings.meta_keywords}
          onChange={(v) => set("meta_keywords", v)}
        />
        <TextField
          def={{ key: "support_email", label: "Support email", type: "email" }}
          value={settings.support_email}
          onChange={(v) => set("support_email", v)}
        />
      </Section>

      <Section
        title="Homepage hero"
        description="Eyebrow, headline, subtitle, and search box on the public home page."
      >
        <TextField
          def={{ key: "homepage_eyebrow", label: "Eyebrow (small label above title)" }}
          value={settings.homepage_eyebrow}
          onChange={(v) => set("homepage_eyebrow", v)}
        />
        <TextField
          def={{ key: "homepage_hero_title", label: "Hero title" }}
          value={settings.homepage_hero_title}
          onChange={(v) => set("homepage_hero_title", v)}
        />
        <TextField
          def={{
            key: "homepage_hero_subtitle",
            label: "Hero subtitle",
            multiline: true,
          }}
          value={settings.homepage_hero_subtitle}
          onChange={(v) => set("homepage_hero_subtitle", v)}
        />
        <TextField
          def={{
            key: "homepage_search_placeholder",
            label: "Search placeholder",
          }}
          value={settings.homepage_search_placeholder}
          onChange={(v) => set("homepage_search_placeholder", v)}
        />
      </Section>

      <Section title="Homepage sections" description="Headings for guides, brands, and topics blocks.">
        <TextField
          def={{ key: "homepage_guides_heading", label: "Latest guides heading" }}
          value={settings.homepage_guides_heading}
          onChange={(v) => set("homepage_guides_heading", v)}
        />
        <TextField
          def={{ key: "homepage_brands_heading", label: "Brands heading" }}
          value={settings.homepage_brands_heading}
          onChange={(v) => set("homepage_brands_heading", v)}
        />
        <TextField
          def={{ key: "homepage_topics_heading", label: "Topics heading" }}
          value={settings.homepage_topics_heading}
          onChange={(v) => set("homepage_topics_heading", v)}
        />
        <TextField
          def={{
            key: "homepage_coming_soon_label",
            label: "Coming soon label (brands without guides)",
          }}
          value={settings.homepage_coming_soon_label}
          onChange={(v) => set("homepage_coming_soon_label", v)}
        />
      </Section>

      <Section title="Footer" description="Tagline and copyright line under the year.">
        <TextField
          def={{ key: "footer_tagline", label: "Footer tagline", multiline: true }}
          value={settings.footer_tagline}
          onChange={(v) => set("footer_tagline", v)}
        />
        <TextField
          def={{
            key: "footer_copyright",
            label: "Copyright suffix",
            help: "Shown after “© YEAR SiteName.”",
          }}
          value={settings.footer_copyright}
          onChange={(v) => set("footer_copyright", v)}
        />
      </Section>

      <Section title="Features">
        <TextField
          def={{
            key: "default_locale",
            label: "Default locale",
            help: "e.g. en or de",
          }}
          value={settings.default_locale}
          onChange={(v) => set("default_locale", v)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!settings.maintenance_mode}
            onChange={(e) => set("maintenance_mode", e.target.checked)}
            className="h-4 w-4"
          />
          Maintenance mode (show banner / limit public writes)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!settings.allow_signups}
            onChange={(e) => set("allow_signups", e.target.checked)}
            className="h-4 w-4"
          />
          Allow new user sign-ups
        </label>
      </Section>

      <div className="flex flex-wrap gap-2 pb-8">
        <button
          type="button"
          onClick={save}
          disabled={saving || backend !== "neon"}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </button>
      </div>
    </div>
  );
}
