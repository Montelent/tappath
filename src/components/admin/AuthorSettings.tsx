"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Save,
  RefreshCw,
  ImageIcon,
  Upload,
  ExternalLink,
  User,
} from "lucide-react";
import {
  SITE_SETTINGS_DEFAULTS,
  type SiteSettings as Settings,
} from "@/lib/site-settings";
import RichTextEditor from "@/components/admin/RichTextEditor";

const AUTHOR_KEYS: (keyof Settings)[] = [
  "author_name",
  "author_slug",
  "author_title",
  "author_bio",
  "author_full_bio",
  "author_credentials",
  "author_avatar_url",
  "author_email",
  "author_website",
  "author_twitter",
  "author_linkedin",
  "author_github",
  "author_youtube",
  "author_facebook",
  "author_instagram",
  "author_same_as",
];

function Field({
  label,
  help,
  value,
  onChange,
  multiline,
  type = "text",
  rows = 3,
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
  rows?: number;
}) {
  const cls =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      {help && (
        <p className="mb-1.5 text-[11px] leading-snug text-[var(--muted-foreground)]">{help}</p>
      )}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={cls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

export default function AuthorSettings() {
  const [settings, setSettings] = useState<Settings>({ ...SITE_SETTINGS_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      const data = await res.json();
      const next = { ...SITE_SETTINGS_DEFAULTS, ...(data.settings || {}) } as Settings;
      setSettings(next);
    } catch {
      setMessage("Could not load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          settings: Object.fromEntries(AUTHOR_KEYS.map((k) => [k, settings[k]])),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Save failed");
        return;
      }
      setMessage("Author profile saved. It will show on guides and /author/…");
      await load();
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("alt", "Author photo");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Upload failed");
        return;
      }
      set("author_avatar_url", String(data.url || ""));
    } catch {
      setMessage("Upload network error");
    } finally {
      setUploading(false);
    }
  };

  const slug = (settings.author_slug || "editorial").trim() || "editorial";
  const previewPath = `/author/${slug}`;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <User className="h-6 w-6 text-brand-600" />
            Author profile
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            This is the person (or team) shown on every guide. Fill in the basics — beginners only need name, short bio, and a photo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => load()} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Reload
          </button>
          <a href={previewPath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
            <ExternalLink className="h-3.5 w-3.5" /> Preview page
          </a>
        </div>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="label-caps mb-3">Preview on guides</p>
        <div className="flex gap-3">
          {settings.author_avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.author_avatar_url} alt="" className="h-14 w-14 rounded-full object-cover border border-[var(--border)]" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white">
              {(settings.author_name || "?").slice(0, 1)}
            </div>
          )}
          <div>
            <p className="font-medium">{settings.author_name || "Author name"}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{settings.author_title || "Job title"}</p>
            <p className="mt-1 line-clamp-2 text-xs text-[var(--muted-foreground)]">
              {(settings.author_bio || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "Short bio appears here…"}
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">1. Basics (required)</h2>
        <Field label="Display name" help="Shown on every guide and the author page." value={settings.author_name} onChange={(v) => set("author_name", v)} />
        <Field
          label="Profile URL slug"
          help={`Public page will be ${previewPath}`}
          value={settings.author_slug}
          onChange={(v) =>
            set(
              "author_slug",
              v.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "")
            )
          }
        />
        <Field label="Job title / role" help='Example: "Senior Android settings editor"' value={settings.author_title} onChange={(v) => set("author_title", v)} />
        <RichTextEditor
          label="Short bio (guide box)"
          help="1–3 sentences under the name on guide pages. Copy, paste, and select work on mobile and desktop."
          value={settings.author_bio}
          onChange={(v) => set("author_bio", v)}
          minHeight={160}
          compact
          placeholder="Short author bio shown on guides…"
        />
        <Field label="Credentials line" help='Example: "Verified on real devices · Updated each OS release"' value={settings.author_credentials} onChange={(v) => set("author_credentials", v)} />
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">2. Photo</h2>
        <p className="text-[11px] text-[var(--muted-foreground)]">Upload a square photo, or paste an image URL.</p>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--muted)]">
            {settings.author_avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.author_avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <input
              type="url"
              value={settings.author_avatar_url}
              onChange={(e) => set("author_avatar_url", e.target.value)}
              placeholder="https://… or /api/media/…"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadAvatar(f);
                }}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">3. Full bio (author page)</h2>
        <RichTextEditor
          label="Long bio"
          help="Full bio on the author page. Rich text with copy/paste/select on mobile and desktop."
          value={settings.author_full_bio}
          onChange={(v) => set("author_full_bio", v)}
          minHeight={280}
          placeholder="Write the full author bio…"
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">4. Social & contact links</h2>
        <p className="text-[11px] text-[var(--muted-foreground)]">Leave blank to hide. Full URLs work best (https://…).</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Website" type="url" value={settings.author_website} onChange={(v) => set("author_website", v)} />
          <Field label="Public email (optional)" type="email" value={settings.author_email} onChange={(v) => set("author_email", v)} />
          <Field label="X / Twitter" type="url" value={settings.author_twitter} onChange={(v) => set("author_twitter", v)} />
          <Field label="LinkedIn" type="url" value={settings.author_linkedin} onChange={(v) => set("author_linkedin", v)} />
          <Field label="GitHub" type="url" value={settings.author_github} onChange={(v) => set("author_github", v)} />
          <Field label="YouTube" type="url" value={settings.author_youtube} onChange={(v) => set("author_youtube", v)} />
          <Field label="Facebook" type="url" value={settings.author_facebook} onChange={(v) => set("author_facebook", v)} />
          <Field label="Instagram" type="url" value={settings.author_instagram} onChange={(v) => set("author_instagram", v)} />
        </div>
        <Field label="Extra profile links" help="Optional. Comma-separated URLs (for schema.org sameAs)." value={settings.author_same_as} onChange={(v) => set("author_same_as", v)} />
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-md disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save author profile
        </button>
      </div>
    </div>
  );
}
