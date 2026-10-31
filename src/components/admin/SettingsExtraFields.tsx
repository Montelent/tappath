"use client";

import type { SiteSettings as Settings } from "@/lib/site-settings";

type Props = {
  settings: Settings;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
};

function Field({
  label,
  value,
  onChange,
  multiline,
  type = "text",
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
  help?: string;
}) {
  const cls =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      {help && <p className="mb-1 text-[11px] text-[var(--muted-foreground)]">{help}</p>}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

function Box({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function SettingsExtraFields({ settings, set }: Props) {
  return (
    <>
      <Box title="Navigation labels" description="Labels in the header and footer links.">
        {(
          [
            ["nav_home", "Home"],
            ["nav_topics", "Topics"],
            ["nav_devices", "Devices"],
            ["nav_glossary", "Glossary"],
            ["nav_forum", "Forum"],
            ["nav_admin", "Admin"],
            ["nav_sign_in", "Sign in"],
            ["nav_sign_up", "Sign up"],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label} value={String(settings[key] ?? "")} onChange={(v) => set(key, v)} />
        ))}
      </Box>

      <Box title="Homepage extras">
        <Field label="All topics link label" value={settings.homepage_all_topics_label} onChange={(v) => set("homepage_all_topics_label", v)} />
        <Field label="Empty brands message" value={settings.homepage_no_brands_text} onChange={(v) => set("homepage_no_brands_text", v)} />
      </Box>

      <Box title="Footer columns">
        <Field label="Browse column heading" value={settings.footer_browse_heading} onChange={(v) => set("footer_browse_heading", v)} />
        <Field label="Account column heading" value={settings.footer_account_heading} onChange={(v) => set("footer_account_heading", v)} />
        <Field label="Support link label" value={settings.footer_support_label} onChange={(v) => set("footer_support_label", v)} />
      </Box>

      <Box title="Social links" description="Leave blank to hide. Full URLs (https://…).">
        {(
          [
            ["social_twitter", "X / Twitter"],
            ["social_github", "GitHub"],
            ["social_youtube", "YouTube"],
            ["social_discord", "Discord"],
            ["social_linkedin", "LinkedIn"],
            ["social_facebook", "Facebook"],
            ["social_instagram", "Instagram"],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label} type="url" value={String(settings[key] ?? "")} onChange={(v) => set(key, v)} />
        ))}
      </Box>

      <Box title="Maintenance">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!settings.maintenance_mode} onChange={(e) => set("maintenance_mode", e.target.checked)} className="h-4 w-4" />
          Enable maintenance mode (site-wide banner)
        </label>
        <Field label="Maintenance banner message" multiline value={settings.maintenance_message} onChange={(v) => set("maintenance_message", v)} />
      </Box>

      <Box title="Author (E-E-A-T)" description="Shown on guide pages and in HowTo/TechArticle schema.">
        <Field label="Author name" value={settings.author_name} onChange={(v) => set("author_name", v)} />
        <Field label="Job title" value={settings.author_title} onChange={(v) => set("author_title", v)} />
        <Field label="Bio" multiline value={settings.author_bio} onChange={(v) => set("author_bio", v)} />
        <Field label="Avatar URL" type="url" value={settings.author_avatar_url} onChange={(v) => set("author_avatar_url", v)} />
        <Field
          label="Profile links (sameAs)"
          help="Comma-separated URLs (LinkedIn, X, About page) for schema.org sameAs."
          value={settings.author_same_as}
          onChange={(v) => set("author_same_as", v)}
        />
      </Box>

      <Box title="Custom codes" description="Verification tags, analytics, pixels. Paste full HTML/script snippets.">
        <Field label="Head / verification code" help="Google Search Console, Bing, Pinterest meta tags, etc." multiline value={settings.head_code} onChange={(v) => set("head_code", v)} />
        <Field label="Body start code" help="Injected right after <body>." multiline value={settings.body_start_code} onChange={(v) => set("body_start_code", v)} />
        <Field label="Footer code" help="Before </body> — analytics, chat widgets." multiline value={settings.footer_code} onChange={(v) => set("footer_code", v)} />
      </Box>

      <Box title="Ads" description="Paste AdSense / ad network HTML. Empty slots are hidden. Enable the master switch first.">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!settings.ads_enabled} onChange={(e) => set("ads_enabled", e.target.checked)} className="h-4 w-4" />
          Enable ads site-wide
        </label>
        <Field label="Header (below top bar, all pages)" multiline value={settings.ad_header} onChange={(v) => set("ad_header", v)} />
        <Field label="After guide title" multiline value={settings.ad_after_title} onChange={(v) => set("ad_after_title", v)} />
        <Field label="After simulator" multiline value={settings.ad_after_simulator} onChange={(v) => set("ad_after_simulator", v)} />
        <Field label="Mid content (after notes)" multiline value={settings.ad_mid_content} onChange={(v) => set("ad_mid_content", v)} />
        <Field label="Sidebar (desktop guide pages)" multiline value={settings.ad_sidebar} onChange={(v) => set("ad_sidebar", v)} />
        <Field label="Before footer (all pages)" multiline value={settings.ad_before_footer} onChange={(v) => set("ad_before_footer", v)} />
      </Box>
    </>
  );
}
