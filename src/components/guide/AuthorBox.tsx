import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { authorProfilePath, authorSocialLinks } from "@/lib/author";
import { requestOrigin } from "@/components/seo/JsonLd";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** E-E-A-T author box — links to full /author/[slug] profile. */
export default async function AuthorBox() {
  const s = await getSiteSettings();
  const name = (s.author_name || "").trim();
  if (!name) return null;

  const title = (s.author_title || "").trim();
  const bioRaw = (s.author_bio || "").trim();
  const bio = stripHtml(bioRaw);
  const credentials = (s.author_credentials || "").trim();
  const avatar = (s.author_avatar_url || "").trim();
  const profileHref = authorProfilePath(s);
  const profileAbs = `${await requestOrigin()}${profileHref}`;
  const social = authorSocialLinks(s).slice(0, 5);

  return (
    <section
      className="surface-card overflow-hidden"
      aria-label="About the author"
      itemScope
      itemType="https://schema.org/Person"
    >
      <link itemProp="url" href={profileAbs} />
      <div className="border-b border-[var(--border)] bg-[var(--accent-subtle)] px-5 py-2.5 sm:px-6">
        <p className="label-caps">Written & verified by</p>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex gap-4 sm:gap-5">
          <Link
            href={profileHref}
            className="shrink-0 link-quiet"
            aria-label={`${name} profile`}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                itemProp="image"
                className="h-16 w-16 rounded-full object-cover border border-[var(--border)] shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]"
                width={72}
                height={72}
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]"
                style={{ background: "var(--accent)" }}
                aria-hidden
              >
                {name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            {/* itemProp=name must not be on <a> — microdata would use href as name */}
            <Link
              href={profileHref}
              className="font-display text-lg font-medium tracking-tight link-quiet hover:text-[var(--accent)]"
            >
              <span itemProp="name">{name}</span>
            </Link>
            {title && (
              <p
                className="mt-0.5 text-sm text-[var(--muted-foreground)]"
                itemProp="jobTitle"
              >
                {title}
              </p>
            )}
            {credentials && (
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                {credentials}
              </p>
            )}
            {bio && (
              <p
                className="mt-2.5 text-sm leading-relaxed text-[var(--muted-foreground)] line-clamp-3"
                itemProp="description"
              >
                {bio}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link
                href={profileHref}
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                View full profile
              </Link>
              {social.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Author on the web">
                  {social.map((item) => (
                    <li key={item.key}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                        itemProp="sameAs"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
