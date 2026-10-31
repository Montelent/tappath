import Link from "next/link";
import { getSiteSettings, activeSocialLinks } from "@/lib/site-settings";

export default async function Footer() {
  const year = new Date().getFullYear();
  const s = await getSiteSettings();
  const name = s.site_name || "TapPath";
  const social = activeSocialLinks(s);

  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="max-wide page-pad py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div>
            {s.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logo_url}
                alt={name}
                className="h-7 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <p className="font-display text-lg">{name}</p>
            )}
            <p className="mt-2 max-w-xs text-sm text-[var(--muted-foreground)] leading-relaxed">
              {s.footer_tagline}
            </p>
            {social.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {social.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-quiet text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
            <div className="flex flex-col gap-2">
              <span className="label-caps">{s.footer_browse_heading}</span>
              <Link href="/topics" className="link-quiet text-[var(--muted-foreground)]">
                {s.nav_topics}
              </Link>
              <Link href="/devices" className="link-quiet text-[var(--muted-foreground)]">
                {s.nav_devices}
              </Link>
              <Link href="/glossary" className="link-quiet text-[var(--muted-foreground)]">
                {s.nav_glossary}
              </Link>
              <Link href="/forum" className="link-quiet text-[var(--muted-foreground)]">
                {s.nav_forum}
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="label-caps">{s.footer_account_heading}</span>
              <Link href="/sign-in" className="link-quiet text-[var(--muted-foreground)]">
                {s.nav_sign_in}
              </Link>
              {s.allow_signups && (
                <Link href="/sign-up" className="link-quiet text-[var(--muted-foreground)]">
                  {s.nav_sign_up}
                </Link>
              )}
              {s.support_email && (
                <a
                  href={`mailto:${s.support_email}`}
                  className="link-quiet text-[var(--muted-foreground)]"
                >
                  {s.footer_support_label}
                </a>
              )}
            </div>
          </div>
        </div>
        <hr className="rule my-8" />
        <p className="text-xs text-[var(--muted-foreground)]">
          © {year} {name}. {s.footer_copyright}
        </p>
      </div>
    </footer>
  );
}
