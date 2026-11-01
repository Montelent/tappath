import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/site-settings";
import {
  authorProfilePath,
  authorSameAsUrls,
  authorSocialLinks,
} from "@/lib/author";
import JsonLd, { siteBase } from "@/components/seo/JsonLd";
import { listGuides } from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSiteSettings();
  const expected = (s.author_slug || "editorial").trim();
  if (slug !== expected && slug !== "editorial") {
    return { title: "Author" };
  }
  const name = s.author_name || s.site_name;
  const description =
    s.author_bio ||
    s.author_full_bio ||
    `About ${name} — guides and verified menu paths on ${s.site_name}.`;
  return {
    title: `${name} — Author`,
    description: description.replace(/<[^>]+>/g, "").slice(0, 160),
    alternates: { canonical: authorProfilePath(s) },
    openGraph: {
      title: `${name} — Author · ${s.site_name}`,
      description: description.replace(/<[^>]+>/g, "").slice(0, 160),
      type: "profile",
      ...(s.author_avatar_url ? { images: [s.author_avatar_url] } : {}),
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const s = await getSiteSettings();
  const expected = (s.author_slug || "editorial").trim() || "editorial";
  if (slug !== expected && slug !== "editorial") notFound();

  const name = (s.author_name || s.site_name || "Author").trim();
  const title = (s.author_title || "").trim();
  const shortBio = (s.author_bio || "").trim().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const fullBio = (s.author_full_bio || "").trim() || shortBio;
  const credentials = (s.author_credentials || "").trim();
  const avatar = (s.author_avatar_url || "").trim();
  const email = (s.author_email || "").trim();
  const social = authorSocialLinks(s);
  const sameAs = authorSameAsUrls(s);
  const allGuides = await listGuides();
  const guides = allGuides.slice(0, 24);
  const base = siteBase();
  const pageUrl = `${base}${authorProfilePath(s)}`;

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(title ? { jobTitle: title } : {}),
    ...(shortBio || fullBio
      ? { description: (shortBio || fullBio).replace(/<[^>]+>/g, "").slice(0, 300) }
      : {}),
    ...(avatar
      ? { image: avatar.startsWith("http") ? avatar : `${base}${avatar}` }
      : {}),
    url: pageUrl,
    ...(email ? { email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: {
      "@type": "Organization",
      name: s.site_name || "TapPath",
      url: base,
    },
  };

  const profilePageLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: personLd,
    url: pageUrl,
    name: `${name} — Author`,
  };

  return (
    <>
      <JsonLd data={personLd} />
      <JsonLd data={profilePageLd} />
      <div className="page-pad">
        <article className="max-wide section-y max-w-3xl mx-auto">
          <nav
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="link-quiet">
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="text-[var(--foreground)]">Author</span>
          </nav>

          <header className="surface-card overflow-hidden">
            <div className="h-2 w-full" style={{ background: "var(--accent)" }} aria-hidden />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt=""
                    className="h-24 w-24 rounded-full object-cover border border-[var(--border)] shadow-md sm:h-28 sm:w-28"
                    width={112}
                    height={112}
                  />
                ) : (
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-semibold text-white shadow-md sm:h-28 sm:w-28"
                    style={{ background: "var(--accent)" }}
                    aria-hidden
                  >
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-3xl sm:text-4xl">{name}</h1>
                  {title && (
                    <p className="mt-1 text-lg text-[var(--muted-foreground)]">{title}</p>
                  )}
                  {credentials && (
                    <p className="mt-3 inline-flex rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1 text-xs text-[var(--muted-foreground)]">
                      {credentials}
                    </p>
                  )}
                  {shortBio && (
                    <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">{shortBio}</p>
                  )}
                </div>
              </div>
            </div>
          </header>

          {fullBio && (
            <section className="mt-10" aria-labelledby="author-bio">
              <h2 id="author-bio" className="font-display text-xl mb-4">
                About
              </h2>
              <div
                className="prose-author space-y-4 text-[var(--muted-foreground)] leading-relaxed [&_a]:text-[var(--accent)] [&_p]:mb-3"
                dangerouslySetInnerHTML={{
                  __html: fullBio.includes("<")
                    ? fullBio
                    : fullBio
                        .split(/\n\n+/)
                        .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
                        .join(""),
                }}
              />
            </section>
          )}

          {(social.length > 0 || email) && (
            <section className="mt-10" aria-labelledby="author-links">
              <h2 id="author-links" className="font-display text-xl mb-4">
                Connect
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {social.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="surface-card flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium link-quiet"
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-[var(--muted-foreground)] truncate max-w-[50%]">
                        {(() => {
                          try {
                            return new URL(item.href).hostname.replace(/^www\./, "");
                          } catch {
                            return "Open";
                          }
                        })()}
                      </span>
                    </a>
                  </li>
                ))}
                {email && (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="surface-card flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium link-quiet"
                    >
                      <span>Email</span>
                      <span className="text-xs text-[var(--muted-foreground)] truncate">{email}</span>
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )}

          {guides.length > 0 && (
            <section className="mt-12" aria-labelledby="author-guides">
              <h2 id="author-guides" className="font-display text-xl mb-4">
                Guides by {name}
              </h2>
              <p className="mb-4 text-sm text-[var(--muted-foreground)]">
                Published how-to guides written and verified by this author.
              </p>
              <ul className="grid-guides">
                {guides.map((g) => {
                  const href = guideHref(g);
                  return (
                    <li key={g.id || g.slug}>
                      <Link href={href} className="surface-card block px-4 py-3.5 link-quiet">
                        <span className="label-caps">
                          {g.brand}
                          {g.category ? ` · ${g.category}` : ""}
                        </span>
                        <span className="mt-1 block font-medium tracking-tight">{g.title}</span>
                        {g.read_time && (
                          <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                            {g.read_time}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <p className="mt-12 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="link-quiet text-[var(--accent)]">
              ← Back to guides
            </Link>
          </p>
        </article>
      </div>
    </>
  );
}
