import Link from "next/link";
import type { Guide } from "@/data/guides";
import LiveSimulator from "./LiveSimulator";
import GuideFeedback from "./GuideFeedback";
import GuideFAQ from "./GuideFAQ";
import AuthorBox from "./AuthorBox";
import AdSlot from "@/components/ads/AdSlot";
import ShareButtons from "@/components/share/ShareButtons";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { listGlossary, listGuides } from "@/lib/db/content";
import { createGuideAutoLinker } from "@/lib/seo/auto-link-content";

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

export default async function GuidePage({ guide }: Props) {
  const [glossary, allGuides] = await Promise.all([listGlossary(), listGuides()]);
  const currentDbGuide = allGuides.find((item) => item.slug === guide.slug && item.brand_slug === guide.brandSlug);
  const autoLink = currentDbGuide ? createGuideAutoLinker(glossary, allGuides, currentDbGuide) : (html: string) => html;
  const steps = guide.versions[0]?.steps?.length ?? 0;
  const versionLabel = guide.versions[0]?.label;
  const deviceModel = guide.compatibleDevices[0]?.name || `${guide.brand} ${guide.productLine}`;
  const verified = formatVerified(guide.updated);
  const excerpt =
    plainText(guide.shortDescription || "") ||
    `How to ${guide.title} on ${guide.brand}`;

  return (
    <div className="page-pad">
      <article className="mx-auto w-full max-w-[96rem] px-0 py-8 sm:py-10">
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

        <div className="grid gap-8 xl:gap-12 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0">
            <header className="max-w-5xl mb-8">
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
                  dangerouslySetInnerHTML={{ __html: autoLink(sanitizeRichHtml(guide.shortDescription)) }}
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

            <section id="guide-steps" className="mb-12 scroll-mt-28" aria-label="Interactive steps">
              <LiveSimulator
                key={guide.slug}
                versions={guide.versions}
                brandName={guide.brand}
                deviceModel={deviceModel}
                pathVerified={guide.forumVerified}
              />
            </section>

            <AdSlot placement="after_simulator" />

            <div className="max-w-none space-y-12">
              <section id="guide-feedback" className="max-w-3xl scroll-mt-28">
                <GuideFeedback
                  key={guide.slug}
                  guideSlug={guide.slug}
                  initialConfirmations={guide.confirmations}
                  forumVerified={guide.forumVerified}
                />
              </section>

              {guide.article?.length > 0 && (
                <section id="guide-notes" className="scroll-mt-28">
                  <h2 className="font-display text-xl mb-4">Notes</h2>
                  <div className="space-y-3 text-[var(--muted-foreground)] leading-relaxed">
                    {guide.article.map((p, i) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: autoLink(sanitizeRichHtml(p)) }} />
                    ))}
                  </div>
                </section>
              )}

              {guide.afterStepsContent?.trim() && (
                <section id="guide-additional-info" className="prose prose-sm max-w-none scroll-mt-28 text-[var(--muted-foreground)] leading-relaxed prose-headings:font-display prose-headings:text-[var(--foreground)] prose-a:text-[var(--accent)] prose-img:rounded-xl">
                  <div dangerouslySetInnerHTML={{ __html: autoLink(sanitizeRichHtml(guide.afterStepsContent)) }} />
                </section>
              )}

              {guide.faqs?.length > 0 && (
                <section id="guide-faq" className="scroll-mt-28">
                  <h2 className="font-display text-xl mb-4">FAQ</h2>
                  <GuideFAQ key={guide.slug} faqs={guide.faqs.map((faq) => ({ q: faq.q, a: autoLink(sanitizeRichHtml(faq.a)) }))} />
                </section>
              )}

              {guide.compatibleDevices?.length > 0 && (
                <section id="guide-compatible-devices" className="scroll-mt-28">
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
                <section id="guide-related" className="scroll-mt-28" aria-labelledby="related-guides-heading">
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
            <div className="sticky top-24 space-y-5">
              <section className="surface-card overflow-hidden" aria-label="Guide navigation">
                <div className="border-b border-[var(--border)] px-4 py-3">
                  <h2 className="text-sm font-semibold">In this guide</h2>
                </div>
                <nav className="p-3" aria-label="On this page">
                  <ul className="space-y-1">
                    <li><a href="#guide-steps" className="block rounded-lg px-3 py-2 text-sm link-quiet hover:bg-[var(--muted)]">Step-by-step instructions</a></li>
                    {guide.article?.length > 0 && <li><a href="#guide-notes" className="block rounded-lg px-3 py-2 text-sm link-quiet hover:bg-[var(--muted)]">Notes</a></li>}
                    {guide.afterStepsContent?.trim() && <li><a href="#guide-additional-info" className="block rounded-lg px-3 py-2 text-sm link-quiet hover:bg-[var(--muted)]">Additional information</a></li>}
                    {guide.faqs?.length > 0 && <li><a href="#guide-faq" className="block rounded-lg px-3 py-2 text-sm link-quiet hover:bg-[var(--muted)]">Frequently asked questions</a></li>}
                    {guide.compatibleDevices?.length > 0 && <li><a href="#guide-compatible-devices" className="block rounded-lg px-3 py-2 text-sm link-quiet hover:bg-[var(--muted)]">Compatible devices</a></li>}
                    {guide.related?.length > 0 && <li><a href="#guide-related" className="block rounded-lg px-3 py-2 text-sm link-quiet hover:bg-[var(--muted)]">Related guides</a></li>}
                  </ul>
                </nav>
                <div className="border-t border-[var(--border)] px-4 py-3">
                  <p className="label-caps mb-2">Guide details</p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-3"><dt className="text-[var(--muted-foreground)]">Device</dt><dd className="text-right font-medium">{deviceModel}</dd></div>
                    <div className="flex items-start justify-between gap-3"><dt className="text-[var(--muted-foreground)]">Reading time</dt><dd className="text-right font-medium">{guide.readTime}</dd></div>
                    {steps > 0 && <div className="flex items-start justify-between gap-3"><dt className="text-[var(--muted-foreground)]">Steps</dt><dd className="text-right font-medium">{steps}</dd></div>}
                    {verified && <div className="flex items-start justify-between gap-3"><dt className="text-[var(--muted-foreground)]">Verified</dt><dd className="text-right font-medium">{verified}</dd></div>}
                  </dl>
                </div>
              </section>
              <AdSlot placement="sidebar" />
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
