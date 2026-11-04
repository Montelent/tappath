import Link from "next/link";
import { getSiteSettings, activeSocialLinks, type NavMenuItem } from "@/lib/site-settings";

export default async function Footer() {
  const year = new Date().getFullYear();
  const s = await getSiteSettings();
  const name = s.site_name || "TapPath";
  const social = activeSocialLinks(s);
  const footerItems: NavMenuItem[] = Array.isArray(s.footer_items) && s.footer_items.length
    ? s.footer_items
    : [
        { id: "topics", label: s.nav_topics, href: "/topics" },
        { id: "devices", label: s.nav_devices, href: "/devices" },
        { id: "glossary", label: s.nav_glossary, href: "/glossary" },
        { id: "forum", label: s.nav_forum, href: "/forum" },
      ];

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
              {footerItems.map((item) => (
                <div key={item.id}>
                  <Link href={item.href} {...(item.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="link-quiet text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    {item.label}
                  </Link>
                  {item.children?.length ? (
                    <div className="ml-3 mt-1 flex flex-col gap-1.5 border-l border-[var(--border)] pl-3">
                      {item.children.map((child) => (
                        <Link key={child.id} href={child.href} {...(child.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="link-quiet text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{child.label}</Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
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
