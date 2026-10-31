import Link from "next/link";
import type { Guide } from "@/data/guides";
import LiveSimulator from "./LiveSimulator";
import GuideFeedback from "./GuideFeedback";
import GuideFAQ from "./GuideFAQ";
import AuthorBox from "./AuthorBox";
import AdSlot from "@/components/ads/AdSlot";

type Props = { guide: Guide };

function formatVerified(raw: string): string {
  if (!raw) return "";
  if (/^\d{1,2}\s+\w+\s+\d{4}/.test(raw)) return raw;
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  return raw;
}

export default function GuidePage({ guide }: Props) {
  const steps = guide.versions[0]?.steps?.length ?? 0;
  const versionLabel = guide.versions[0]?.label;
  const verified = formatVerified(guide.updated);

  return (
    <div className="page-pad">
      <article className="max-wide py-8 sm:py-10">
        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="link-quiet">Home</Link>
          <span aria-hidden>/</span>
          <Link href={`/${guide.brandSlug}`} className="link-quiet">{guide.brand}</Link>
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
              <h1 className="font-display text-3xl sm:text-4xl text-balance">{guide.title}</h1>
              {guide.shortDescription && (
                <div
                  className="mt-4 text-[var(--muted-foreground)] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: guide.shortDescription }}
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
                  <h2 className="font-display text-xl mb-4">
                    {guide.brand}: {guide.title}
                  </h2>
                  <div className="space-y-4 text-[var(--muted-foreground)] leading-relaxed">
                    {guide.article.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>
              )}

              <AdSlot placement="mid_content" />

              {guide.faqs?.length > 0 && (
                <section>
                  <h2 className="font-display text-xl mb-4">Frequently asked questions</h2>
                  <GuideFAQ faqs={guide.faqs} />
                </section>
              )}

              {guide.compatibleDevices && guide.compatibleDevices.length > 0 && (
                <section>
                  <h2 className="font-display text-xl mb-4">Compatible devices</h2>
                  <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                    Tap a device for more guides on that model.
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {guide.compatibleDevices.map((d) => (
                      <li key={d.href || d.name}>
                        <Link
                          href={d.href || `/${guide.brandSlug}`}
                          className="inline-block rounded-full border border-[var(--border)] px-3 py-1.5 text-sm link-quiet hover:border-[var(--accent)]"
                        >
                          {d.name}
                          {d.os ? (
                            <span className="ml-1 text-xs text-[var(--muted-foreground)]">{d.os}</span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {guide.related?.length > 0 && (
                <section>
                  <h2 className="font-display text-xl mb-4">More guides for {guide.brand}</h2>
                  <ul className="border-t border-[var(--border)]">
                    {guide.related.map((r) => (
                      <li key={r.href} className="border-b border-[var(--border)]">
                        <Link href={r.href} className="block py-3 link-quiet break-words">
                          {r.title}
                          {r.category && <span className="label-caps ml-2">{r.category}</span>}
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
              <div className="rounded-2xl border border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
                <p className="label-caps mb-2 text-[var(--foreground)]">On this page</p>
                <ul className="space-y-1.5">
                  <li>Step-by-step simulator</li>
                  {guide.article?.length > 0 && <li>Notes</li>}
                  {guide.faqs?.length > 0 && <li>FAQ</li>}
                  {guide.compatibleDevices?.length > 0 && <li>Compatible devices</li>}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
