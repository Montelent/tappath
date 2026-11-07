import Link from "next/link";
import type { Guide } from "@/data/guides";
import LiveSimulator from "./LiveSimulator";
import GuideFeedback from "./GuideFeedback";
import GuideFAQ from "./GuideFAQ";
import AuthorBox from "./AuthorBox";
import AdSlot from "@/components/ads/AdSlot";
import ShareButtons from "@/components/share/ShareButtons";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

type Props = {
  guide: Guide;
};

function formatVerified(raw: string): string {
  if (!raw) return "";
  if (/^\d{1,2}\s+\w+\s+\d{4}/.test(raw)) return raw;
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return raw;
}

function plainText(html: string, max = 200): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export default function GuidePage({ guide }: Props) {
  const steps = guide.versions[0]?.steps?.length ?? 0;
  const versionLabel = guide.versions[0]?.label;
  const verified = formatVerified(guide.updated);
  const excerpt =
    plainText(guide.shortDescription || "") ||
    `How to ${guide.title} on ${guide.brand}`;

  return (
    <div className="page-pad">
      <article className="max-wide py-8 sm:py-10">
        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="link-quiet">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link href={`/${guide.brandSlug}`} className="link-quiet">
            {guide.brand}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[var(--foreground)] break-words">{guide.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
          <div className="min-w-0">
            <header className="max-w-2xl mb-8">
              <p className="label-caps mb-2">
                {guide.brand}
                {guide.category ? ` · ${guide.category}` : ""}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl text-balance">
                {guide.title}
              </h1>
              {guide.shortDescription && (
                <div
                  className="mt-4 text-[var(--muted-foreground)] leading-relaxed prose-a:text-[var(--accent)]"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(guide.shortDescription) }}
                />
              )}
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                {verified && (
                  <>
                    Last verified: {verified}
                    {versionLabel ? ` · ${versionLabel}` : ""}
                    {" · "}
                  </>
                )}
                {guide.readTime}
                {steps > 0 && ` · ${steps} steps`}
              </p>
            </header>

            {guide.featuredImageUrl ? (
              <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={guide.featuredImageUrl}
                  alt=""
                  className="aspect-[1.91/1] w-full object-cover"
                />
              </div>
            ) : null}

            <div className="mb-8">
              <ShareButtons
                title={guide.title}
                shareTitle={`${guide.brand}: ${guide.title}`}
                description={excerpt}
              />
            </div>

            <AdSlot placement="after_title" />

            <section className="mb-12" aria-label="Interactive steps">
              <LiveSimulator
                versions={guide.versions}
                brandName={guide.brand}
                deviceModel="Galaxy S23+"
              />
            </section>

            <AdSlot placement="after_simulator" />

            <div className="max-w-2xl space-y-12">
              <section className="max-w-xl">
                <GuideFeedback
                  guideSlug={guide.slug}
                  initialConfirmations={guide.confirmations}
                  forumVerified={guide.forumVerified}
                />
              </section>

              {guide.article?.length > 0 && (
                <section>
                  <h2 className="font-display text-xl mb-4">Notes</h2>
                  <div className="space-y-3 text-[var(--muted-foreground)] leading-relaxed">
                    {guide.article.map((p, i) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(p) }} />
                    ))}
                  </div>
                </section>
              )}

              {guide.faqs?.length > 0 && (
                <section>
                  <h2 className="font-display text-xl mb-4">FAQ</h2>
                  <GuideFAQ faqs={guide.faqs.map((faq) => ({ q: faq.q, a: sanitizeRichHtml(faq.a) }))} />
                </section>
              )}

              {guide.compatibleDevices?.length > 0 && (
                <section>
                  <h2 className="font-display text-xl mb-4">Compatible devices</h2>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {guide.compatibleDevices.map((d) => (
                      <li key={d.name + d.os}>
                        <Link
                          href={d.href || `/${guide.brandSlug}`}
                          className="surface-card block px-4 py-3 text-sm link-quiet"
                        >
                          <span className="font-medium">{d.name}</span>
                          {d.os ? (
                            <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                              {d.os}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {guide.related?.length > 0 && (
                <section aria-labelledby="related-guides-heading">
                  <h2 id="related-guides-heading" className="font-display text-xl mb-4">
                    Related guides
                  </h2>
                  <ul className="grid-guides">
                    {guide.related.map((r) => (
                      <li key={r.href}>
                        <Link href={r.href} className="surface-card block px-4 py-3.5 link-quiet h-full">
                          {r.category && <span className="label-caps">{r.category}</span>}
                          <span className="mt-1 block font-medium tracking-tight break-words">
                            {r.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <AuthorBox />
            </div>
          </div>

          <aside className="hidden lg:block min-w-0">
            <div className="sticky top-20 space-y-6">
              <AdSlot placement="sidebar" />
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
