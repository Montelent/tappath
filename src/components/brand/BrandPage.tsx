import Link from "next/link";
import type { Brand } from "@/data/brands";
import BrandJsonLd from "@/components/seo/BrandJsonLd";
import { brandColorCss, brandColorTint } from "@/lib/brand-color";

type Props = { brand: Brand };

export default function BrandPage({ brand }: Props) {
  const lines = (brand.productLines || []).filter((pl) => (pl.count ?? 0) > 0);
  const topGuides = brand.topGuides || [];
  const color = brandColorCss(brand.color);
  const tint = brandColorTint(brand.color, 0.1);

  return (
    <>
      <BrandJsonLd
        name={brand.name}
        slug={brand.slug}
        description={brand.description || `${brand.name} settings guides and verified menu paths.`}
        guides={(brand.topGuides || []).map((g) => ({ title: g.title, href: g.href }))}
      />
      <div className="page-pad">
        <div className="max-wide section-y">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]" aria-label="Breadcrumb">
            <Link href="/" className="link-quiet">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-[var(--foreground)]">{brand.name}</span>
          </nav>

          <header
            className="max-w-2xl rounded-2xl border border-[var(--border)] p-6 sm:p-8 mb-10"
            style={{ borderTopWidth: 4, borderTopColor: color, background: tint }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold text-white shadow-sm"
                style={{ backgroundColor: color }}
                aria-hidden
              >
                {brand.name.slice(0, 1)}
              </span>
              <p className="label-caps">{brand.name}</p>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl">{brand.name} settings guides</h1>
            {brand.description && (
              <div className="mt-4 text-[var(--muted-foreground)] leading-relaxed" dangerouslySetInnerHTML={{ __html: brand.description }} />
            )}
            <p className="mt-4 font-path text-sm text-[var(--muted-foreground)]">
              {brand.guides} {brand.guides === 1 ? "guide" : "guides"}
              {brand.devices > 0 && (
                <>
                  {" · "}
                  {brand.devices} {brand.devices === 1 ? "device" : "devices"}
                </>
              )}
            </p>
          </header>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_minmax(0,16rem)]">
            <div className="min-w-0 space-y-12">
              {lines.length > 0 && (
                <section>
                  <h2 className="font-display text-xl mb-4">Product lines</h2>
                  <ul className="border-t border-[var(--border)]">
                    {lines.map((pl) => (
                      <li key={pl.href} className="border-b border-[var(--border)]">
                        <Link href={pl.href} className="flex items-baseline justify-between gap-4 py-3.5 link-quiet min-w-0">
                          <span className="font-medium truncate">{pl.name}</span>
                          <span className="font-path text-sm text-[var(--muted-foreground)] shrink-0 tabular-nums">{pl.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {topGuides.length > 0 && (
                <section>
                  <h2 className="font-display text-xl mb-4">Guides</h2>
                  <ul className="grid-guides list-none">
                    {topGuides.map((g) => (
                      <li key={g.href}>
                        <Link href={g.href} className="surface-card block h-full p-4 link-quiet">
                          <span className="block font-medium break-words">{g.title}</span>
                          {g.category && <span className="label-caps mt-1.5 block">{g.category}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {lines.length === 0 && topGuides.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">No guides for {brand.name} yet.</p>
              )}
            </div>

            <aside className="min-w-0 lg:border-l lg:border-[var(--border)] lg:pl-8">
              <p className="label-caps mb-3">Also</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/topics" className="link-quiet text-[var(--muted-foreground)]">All topics</Link></li>
                <li><Link href="/devices" className="link-quiet text-[var(--muted-foreground)]">Device directory</Link></li>
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
