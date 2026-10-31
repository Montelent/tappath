import Link from "next/link";
import type { Guide } from "@/data/guides";
import LiveSimulator from "./LiveSimulator";
import GuideFeedback from "./GuideFeedback";
import GuideFAQ from "./GuideFAQ";

type Props = { guide: Guide };

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

export default function GuidePage({ guide }: Props) {
  const steps = guide.versions[0]?.steps?.length ?? 0;
  const versionLabel = guide.versions[0]?.label;
  const verified = formatVerified(guide.updated);

  return (
    <div className="page-pad">
      <article className="max-wide py-8 sm:py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <Link href="/" className="link-quiet">Home</Link>
          <span aria-hidden>/</span>
          <Link href={`/${guide.brandSlug}`} className="link-quiet">{guide.brand}</Link>
          <span aria-hidden>/</span>
          <span className="text-[var(--foreground)] break-words">{guide.title}</span>
        </nav>

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

        <section className="mb-12" aria-label="Interactive steps">
          <LiveSimulator
            versions={guide.versions}
            brandName={guide.brand}
            deviceModel="Galaxy S23+"
          />
        </section>

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
              <div className="space-y-4 text-[var(--muted-foreground)] leading-relaxed">
                {guide.article.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {guide.faqs?.length > 0 && (
            <section>
              <h2 className="font-display text-xl mb-4">Questions</h2>
              <GuideFAQ faqs={guide.faqs} />
            </section>
          )}

          {guide.related?.length > 0 && (
            <section>
              <h2 className="font-display text-xl mb-4">Related</h2>
              <ul className="border-t border-[var(--border)]">
                {guide.related.map((r) => (
                  <li key={r.href} className="border-b border-[var(--border)]">
                    <Link href={r.href} className="block py-3 link-quiet break-words">
                      {r.title}
                      {r.category && (
                        <span className="label-caps ml-2">{r.category}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
